# Meetup MCP Server

다중 사용자의 위도/경도를 입력받아 중간 지점 주변 식당을 추천하는 FastAPI 기반 MCP 서버입니다.

## 주요 기능

- 다중 사용자 좌표 기반 중간 지점 계산
- 카카오/네이버 API를 통한 식당 검색
- 네이버 이미지 검색 API를 통한 식당 이미지 제공
- Redis 기반 캐시 시스템 (비활성화 가능)
- MCP(Model Context Protocol) 지원

## 설치 및 실행

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경변수 설정

다음 환경변수들을 설정하세요:

```bash
# API 키 (필수)
export KAKAO_API_KEY="your_kakao_api_key"
export NAVER_CLIENT_ID="your_naver_client_id"
export NAVER_CLIENT_SECRET="your_naver_client_secret"

# 캐시 설정 (선택)
export CACHE_ENABLED="true"  # true/false
export REDIS_HOST="localhost"
export REDIS_PORT="6379"
export REDIS_DB="0"

# 서버 설정 (선택)
export SERVER_HOST="0.0.0.0"
export SERVER_PORT="9000"
export LOG_LEVEL="INFO"
```

### 3. Redis 설치 (캐시 사용 시)

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### 4. 서버 실행

```bash
cd backend
python server.py
```

## API 엔드포인트

### 기본 엔드포인트

- `GET /` - 서비스 정보
- `GET /health` - 헬스 체크
- `GET /mcp/tools` - MCP 도구 목록
- `POST /mcp/call` - MCP 도구 호출

### 캐시 관리

- `GET /cache/stats` - 캐시 통계
- `POST /cache/clear` - 캐시 삭제

## MCP 도구 사용법

### recommend_meetup_restaurants

다중 사용자 기반 식당 추천

**요청 예시:**
```json
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
```

**응답 예시:**
```json
{
  "content": {
    "midpoint": {
      "lat": 37.4804,
      "lng": 127.04435,
      "address": "서울특별시 서초구",
      "road_address": "서울특별시 서초구 남부순환로",
      "jibun_address": "서울특별시 서초구 양재동",
      "region1": "서울특별시",
      "region2": "서초구",
      "region3": "양재동"
    },
    "users": [
      {"lat": 37.5665, "lng": 126.9780},
      {"lat": 37.3943, "lng": 127.1107}
    ],
    "restaurants": [
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
        "image_url": "https://...",
        "source": "kakao"
      }
    ],
    "source_stats": {"kakao": 5, "naver": 0, "total": 5},
    "query": "한식 맛집",
    "total_found": 5,
    "returned": 5
  },
  "isError": false
}
```

## 캐시 설정

### 캐시 비활성화

```bash
export CACHE_ENABLED="false"
```

### 캐시 통계 확인

```bash
curl http://localhost:9000/cache/stats
```

### 캐시 삭제

```bash
# 모든 캐시 삭제
curl -X POST http://localhost:9000/cache/clear

# 특정 패턴 삭제
curl -X POST "http://localhost:9000/cache/clear?pattern=kakao_search:*"
```

## 로그

로그는 `./logs/meetup_server.log` 파일에 저장됩니다.

## 문제 해결

### Redis 연결 실패
- Redis 서버가 실행 중인지 확인
- `CACHE_ENABLED="false"`로 설정하여 캐시 비활성화

### API 키 오류
- 카카오/네이버 API 키가 올바르게 설정되었는지 확인
- API 키의 권한과 할당량 확인

### 포트 충돌
- `SERVER_PORT` 환경변수로 다른 포트 사용
- 실행 중인 프로세스 확인: `lsof -i :9000`
