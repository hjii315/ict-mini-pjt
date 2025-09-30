#!/usr/bin/env python3
"""
Meetup MCP Server
다중 사용자의 위도/경도를 입력받아 중간 지점 주변 식당을 추천하는 FastAPI 기반 MCP 서버.

입력 파라미터:
- users: 사용자 정보 리스트 [{"lat": float, "lng": float}, ...]
- radius (m): 검색 반경 (기본 1000m)
- cuisine: 선호 요리 키워드(선택)
- max_results: 결과 개수 제한 (기본 15)

응답:
- midpoint: 중간 지점 좌표
- users: 입력된 사용자 정보
- restaurants: 식당 목록(이름, 주소, 좌표, 전화, 카테고리, 이미지 URL 등)
- source_stats: 출처별 카운트
- query: 사용된 검색 쿼리
- returned/total_found

이미지 URL: NAVER 이미지 검색 API를 보유한 경우 식당명으로 대표 이미지 1건을 조회하여 첨부.
KAKAO Local / NAVER Local이 모두 불가한 경우 빈 배열 반환.
"""

import json
import logging
import os
import sys
from typing import Dict, Any, List, Optional
from datetime import datetime

import aiohttp
from fastapi import FastAPI, HTTPException, Body, Request
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.wsgi import WSGIMiddleware
import uvicorn

# 공통 유틸리티 모듈 추가
sys.path.append('./common')
from validation import validate_users, extract_search_parameters
from schemas import MCP_TOOLS
from geocoding_service import geocoding_service
from cache_manager import cache_manager, cache_result
from config import config


# =============================================================================
# LOGGING
# =============================================================================

# 로그 디렉토리 생성
os.makedirs(config.LOG_DIR, exist_ok=True)

logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(f'{config.LOG_DIR}/meetup_server.log')
    ]
)
logger = logging.getLogger(__name__)


# =============================================================================
# APP
# =============================================================================

app = FastAPI(title="Meetup MCP Server", version="1.0.0")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app import app as flask_app                     # ← 추가 (중복 금지!)
app.mount("/calculator", WSGIMiddleware(flask_app))       # ← 추가 (반드시 FastAPI 생성 '후')

# =============================================================================
# MIDDLEWARE (Request/Response logging)
# =============================================================================

@app.middleware("http")
async def log_requests(request: Request, call_next):
    """함수명: log_requests
    기능: 모든 HTTP 요청/응답을 로깅합니다.
    요청 파라미터(예시):
      - 없음 (미들웨어가 요청/응답 객체를 가로채서 처리)
    응답 파라미터(예시):
      - 원래 엔드포인트의 응답과 동일
      {
        "status": "healthy",
        "service": "meetup"
      }
    """
    body_bytes = b""
    try:
        body_bytes = await request.body()
        body = body_bytes.decode("utf-8") if body_bytes else ""
        logger.info(f"[REQ] {request.method} {request.url.path} body={body}")
    except Exception as e:
        logger.warning(f"[REQ] read error: {e}")

    async def receive():
        return {"type": "http.request", "body": body_bytes}

    request._receive = receive

    response = await call_next(request)

    try:
        content = b""
        async for chunk in response.body_iterator:
            content += chunk
        new_response = Response(content=content, status_code=response.status_code, headers=dict(response.headers), media_type=response.media_type)
        sample = content.decode("utf-8", errors="ignore")
        if len(sample) > 1000:
            sample = sample[:1000] + "... [truncated]"
        logger.info(f"[RES] {request.method} {request.url.path} {response.status_code} body={sample}")
        return new_response
    except Exception as e:
        logger.warning(f"[RES] log error: {e}")
        return response


# =============================================================================
# SERVICES
# =============================================================================

class PlaceSearchService:
    def __init__(self) -> None:
        """함수명: PlaceSearchService.__init__
        기능: 외부 API(Naver/Kakao) 사용을 위한 인증 헤더 및 기본 상태를 초기화합니다.
        요청 파라미터(예시):
          - 없음 (환경변수 KAKAO_API_KEY, NAVER_CLIENT_ID, NAVER_CLIENT_SECRET 사용)
        응답 파라미터(예시):
          - 없음 (인스턴스 내부 상태 설정)
        """
        # Kakao Local API
        self.kakao_api_key = config.KAKAO_API_KEY
        self.kakao_headers = {"Authorization": f"KakaoAK {self.kakao_api_key}"} if self.kakao_api_key else None

        # Naver Search (local + image)
        self.naver_client_id = config.NAVER_CLIENT_ID
        self.naver_client_secret = config.NAVER_CLIENT_SECRET
        self.naver_headers = {
            "X-Naver-Client-Id": self.naver_client_id,
            "X-Naver-Client-Secret": self.naver_client_secret,
        } if self.naver_client_id and self.naver_client_secret else None

    @staticmethod
    def compute_midpoint(users: List[Dict[str, Any]]) -> Dict[str, float]:
        """함수명: compute_midpoint
        기능: 다중 사용자 좌표의 산술 평균으로 중간 지점(lat/lng)을 계산합니다.
        요청 파라미터(예시):
          users = [
            {"lat": 37.5665, "lng": 126.9780},
            {"lat": 37.3943, "lng": 127.1107}
          ]
        응답 파라미터(예시):
          {"lat": 37.4804, "lng": 127.04435}
        """
        if not users or len(users) < 2:
            raise ValueError("최소 2명의 사용자가 필요합니다")

        total_lat = sum(float(user["lat"]) for user in users)
        total_lng = sum(float(user["lng"]) for user in users)
        count = len(users)
        
        return {
            "lat": total_lat / count,
            "lng": total_lng / count
        }

    @cache_result("kakao_search", ttl=1800)  # 30분 캐시
    async def search_kakao_category(self, lat: float, lng: float, radius: int, query: Optional[str], size: int) -> List[Dict[str, Any]]:
        """함수명: search_kakao_category
        기능: 카카오 키워드 검색 API로 특정 좌표 주변의 장소(음식점)를 검색합니다.
        요청 파라미터(예시):
          lat=37.4804, lng=127.04435, radius=1500, query="한식 맛집", size=5
        응답 파라미터(예시):
          [
            {
              "place_id": "26410902",
              "place_name": "설마중",
              "place_url": "http://place.map.kakao.com/26410902",
              "place_phone": "02-3462-8888",
              "place_address": "서울 서초구 양재동 2-3",
              "place_road_address": "서울 서초구 남부순환로 2648",
              "place_category": "음식점 > 한식",
              "place_x": 127.04037,
              "place_y": 37.48501,
              "distance": "621",
              "image_url": "",
              "source": "kakao"
            }
          ]
        """
        if not self.kakao_headers:
            return []
        try:
            # Kakao: keyword search around coordinate
            # category_group_code FD6 = 음식점
            url = "https://dapi.kakao.com/v2/local/search/keyword.json"
            params = {
                "query": f"{query or '맛집'}",
                "x": f"{lng}",
                "y": f"{lat}",
                "radius": min(max(radius, 1), 20000),  # Kakao max 20km
                "size": min(max(size, 1), 15),         # Kakao max 15
            }
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.kakao_headers, params=params, timeout=10) as resp:
                    if resp.status != 200:
                        txt = await resp.text()
                        logger.warning(f"Kakao search failed: {resp.status} {txt}")
                        return []
                    data = await resp.json()
                    restaurants: List[Dict[str, Any]] = []
                    for d in data.get("documents", []):
                        restaurants.append({
                            "place_id": d.get("id", ""),
                            "place_name": d.get("place_name", ""),
                            "place_url": d.get("place_url", ""),
                            "place_phone": d.get("phone", ""),
                            "place_address": d.get("address_name", ""),
                            "place_road_address": d.get("road_address_name", ""),
                            "place_category": d.get("category_name", ""),
                            "place_x": float(d.get("x", 0) or 0),
                            "place_y": float(d.get("y", 0) or 0),
                            "distance": d.get("distance", ""),
                            "image_url": "",
                            "source": "kakao",
                        })
                    return restaurants
        except Exception as e:
            logger.error(f"Kakao search error: {e}")
            return []

    @cache_result("naver_image", ttl=3600)  # 1시간 캐시
    async def naver_image_for(self, place_name: str) -> str:
        """함수명: naver_image_for
        기능: 네이버 이미지 검색 API로 장소명에 대한 대표 이미지 URL 1건을 조회합니다.
        요청 파라미터(예시):
          place_name="설마중"
        응답 파라미터(예시):
          "https://.../image.jpg"  (없을 경우 빈 문자열)
        """
        if not self.naver_headers or not place_name:
            return ""
        try:
            url = "https://openapi.naver.com/v1/search/image"
            params = {"query": place_name, "display": 1, "sort": "sim"}
            async with aiohttp.ClientSession() as session:
                async with session.get(url, headers=self.naver_headers, params=params, timeout=10) as resp:
                    if resp.status != 200:
                        return ""
                    data = await resp.json()
                    items = data.get("items", [])
                    if items:
                        return items[0].get("link", "") or items[0].get("thumbnail", "") or ""
                    return ""
        except Exception:
            return ""

    async def enrich_images(self, restaurants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """함수명: enrich_images
        기능: 식당 리스트 각 항목에 이미지 URL이 없으면 네이버 이미지 검색으로 보강합니다.
        요청 파라미터(예시):
          restaurants=[{"place_name":"설마중", "image_url":""}, ...]
        응답 파라미터(예시):
          restaurants=[{"place_name":"설마중", "image_url":"https://...jpg"}, ...]
        """
        if not restaurants:
            return restaurants
        result: List[Dict[str, Any]] = []
        for r in restaurants:
            if not r.get("image_url"):
                img = await self.naver_image_for(r.get("place_name", ""))
                if img:
                    r["image_url"] = img
            result.append(r)
        return result

    @cache_result("meetup_search", ttl=900)  # 15분 캐시
    async def search_meetup_restaurants(self, users: List[Dict[str, Any]], radius: int = 1000, 
                                        cuisine: Optional[str] = None, max_results: int = 15) -> Dict[str, Any]:
        """함수명: search_meetup_restaurants
        기능: 다중 사용자 중간 지점 계산 후 주변 식당을 검색하고 이미지 URL을 보강합니다.
        요청 파라미터(예시):
          users=[
            {"lat":37.5665,"lng":126.9780},
            {"lat":37.3943,"lng":127.1107}
          ], radius=1500, cuisine="한식", max_results=5
        응답 파라미터(예시):
          {
            "midpoint": {"lat": 37.4804, "lng": 127.04435},
            "users": [...],
            "restaurants": [ {"place_name":"설마중", "image_url":"https://..."}, ... ],
            "source_stats": {"kakao":5, "naver":0, "total":5},
            "query": "한식 맛집",
            "total_found": 5,
            "returned": 5
          }
        """
        midpoint = self.compute_midpoint(users)
        
        # 중간 지점의 주소 정보 가져오기
        address_info = await geocoding_service.reverse_geocode(
            midpoint["lat"], 
            midpoint["lng"]
        )
        
        # midpoint에 주소 정보 추가
        midpoint_with_address = {
            "lat": midpoint["lat"],
            "lng": midpoint["lng"],
            "address": address_info.get("address", ""),
            "road_address": address_info.get("road_address", ""),
            "jibun_address": address_info.get("jibun_address", ""),
            "region1": address_info.get("region1", ""),
            "region2": address_info.get("region2", ""),
            "region3": address_info.get("region3", "")
        }
        
        keyword = f"{cuisine} 맛집" if cuisine else "맛집"

        kakao_list = await self.search_kakao_category(
            lat=midpoint["lat"],
            lng=midpoint["lng"],
            radius=radius,
            query=keyword,
            size=max_results,
        )

        # 이미지 보강 (가능 시)
        enriched = await self.enrich_images(kakao_list)

        result = enriched[:max_results]
        source_stats = {"kakao": len(result), "naver": 0, "total": len(result)}
        
        # users 정보 생성 (lat, lng만 포함)
        clean_users = [{"lat": user["lat"], "lng": user["lng"]} for user in users]
        
        return {
            "midpoint": midpoint_with_address,
            "users": clean_users,
            "restaurants": result,
            "source_stats": source_stats,
            "query": keyword,
            "total_found": len(enriched),
            "returned": len(result),
        }


service = PlaceSearchService()


# =============================================================================
# MCP TOOLS
# =============================================================================

# 공통 스키마 사용
_MCP_TOOLS = MCP_TOOLS


@app.get("/mcp/tools")
def mcp_list_tools() -> Dict[str, Any]:
    """함수명: mcp_list_tools
    기능: 이 서버가 제공하는 MCP 도구 목록을 반환합니다.
    요청 파라미터(예시):
      - 없음 (GET /mcp/tools)
    응답 파라미터(예시):
      {
        "tools": [{"name":"recommend_meetup_restaurants", "inputSchema": {...}}]
      }
    """
    return {"tools": _MCP_TOOLS}


def _mcp_tool_recommend(arguments: Dict[str, Any]) -> Dict[str, Any]:
    """함수명: _mcp_tool_recommend
    기능: MCP 도구 요청을 검증하고 다중 사용자 기반 식당 추천을 실행합니다.
    요청 파라미터(예시):
      arguments={
        "users": [
          {"lat":37.5665,"lng":126.9780},
          {"lat":37.3943,"lng":127.1107}
        ],
        "radius": 1500,
        "cuisine": "한식",
        "max_results": 5
      }
    응답 파라미터(예시): search_meetup_restaurants의 반환과 동일
    """
    # users 또는 locations 배열 처리 및 검증 (하위 호환성 포함)
    users = arguments.get("users") or arguments.get("locations")
    if not users:
        raise HTTPException(status_code=400, detail="users 또는 locations는 최소 2개의 정보가 필요합니다")
    
    validated_users = validate_users(users, "users")
    
    # 검색 파라미터 추출
    radius, cuisine, max_results = extract_search_parameters(arguments)

    # 비동기 함수 실행
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # 이미 실행 중인 루프가 있는 경우 새 루프 생성
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                result = loop.run_until_complete(
                    service.search_meetup_restaurants(validated_users, radius, cuisine, max_results)
                )
                return result
            finally:
                loop.close()
        else:
            # 기존 루프 사용
            result = loop.run_until_complete(
                service.search_meetup_restaurants(validated_users, radius, cuisine, max_results)
            )
            return result
    except RuntimeError:
        # 루프가 없는 경우 새로 생성
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            result = loop.run_until_complete(
                service.search_meetup_restaurants(validated_users, radius, cuisine, max_results)
            )
            return result
        finally:
            loop.close()


@app.post("/mcp/call")
def mcp_call_tool(payload: Dict[str, Any] = Body(...)) -> Dict[str, Any]:
    """함수명: mcp_call_tool
    기능: MCP 규격의 도구 호출을 받아 내부 도구 구현으로 라우팅합니다.
    요청 파라미터(예시):
      {
        "name": "recommend_meetup_restaurants",
        "arguments": {
          "users": [
            {"lat": 37.5665, "lng": 126.9780},
            {"lat": 37.3943, "lng": 127.1107}
          ],
          "radius": 1500,
          "cuisine": "한식",
          "max_results": 5
        }
      }
    응답 파라미터(예시):
      {"content": {...}, "isError": false}
    """
    name = payload.get("name")
    arguments = payload.get("arguments") or {}
    if not name:
        raise HTTPException(status_code=400, detail="name은 필수입니다")
    try:
        if name == "recommend_meetup_restaurants":
            content = _mcp_tool_recommend(arguments)
        else:
            raise HTTPException(status_code=404, detail=f"알 수 없는 도구: {name}")
        return {"content": content, "isError": False}
    except HTTPException:
        raise
    except Exception as e:
        return {"content": {"error": str(e)}, "isError": True}


# =============================================================================
# BASIC ENDPOINTS
# =============================================================================

@app.get("/")
async def root():
    """함수명: root
    기능: 서비스 정보 및 주요 엔드포인트 목록을 제공합니다.
    요청 파라미터(예시):
      - 없음 (GET /)
    응답 파라미터(예시):
      {"message": "Meetup MCP Server", "endpoints": {...}}
    """
    return {
        "message": "Meetup MCP Server",
        "endpoints": {
            "health": "GET /health",
            "mcp_list_tools": "GET /mcp/tools",
            "mcp_call_tool": "POST /mcp/call",
        }
    }


@app.get("/health")
async def health():
    """함수명: health
    기능: 헬스 체크 엔드포인트로 서비스 상태를 반환합니다.
    요청 파라미터(예시):
      - 없음 (GET /health)
    응답 파라미터(예시):
      {"status":"healthy","service":"meetup"}
    """
    return {"status": "healthy", "service": "meetup"}


@app.get("/cache/stats")
async def cache_stats():
    """함수명: cache_stats
    기능: 캐시 통계 정보를 반환합니다.
    요청 파라미터(예시):
      - 없음 (GET /cache/stats)
    응답 파라미터(예시):
      {"connected": true, "keys": 150, "memory": "2.5MB", "hits": 1000, "misses": 200}
    """
    stats = cache_manager.get_stats()
    return {"cache": stats}


@app.post("/cache/clear")
async def clear_cache(pattern: str = "*"):
    """함수명: clear_cache
    기능: 캐시를 삭제합니다.
    요청 파라미터(예시):
      pattern="*" (모든 캐시) 또는 "kakao_search:*" (특정 패턴)
    응답 파라미터(예시):
      {"deleted": 150, "pattern": "*"}
    """
    deleted_count = cache_manager.delete_pattern(pattern)
    return {"deleted": deleted_count, "pattern": pattern}


if __name__ == "__main__":
    # API 키 상태 확인
    api_status = config.validate_api_keys()
    logger.info(f"API 키 상태: {api_status}")
    
    # 서버 시작
    uvicorn.run(app, host=config.SERVER_HOST, port=config.SERVER_PORT)
