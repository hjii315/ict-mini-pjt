#!/usr/bin/env python3
"""
공통 스키마 정의 모듈
서버와 클라이언트에서 공통으로 사용하는 스키마 정의를 제공합니다.
"""

# MCP 도구 스키마 정의
MCP_TOOL_SCHEMA = {
    "name": "recommend_meetup_restaurants",
    "description": "다중 사용자의 좌표를 받아 중간 지점 주변 식당을 추천합니다. 이미지 URL 포함 시도",
    "inputSchema": {
        "type": "object",
        "properties": {
            "users": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "lat": {"type": "number", "description": "위도"},
                        "lng": {"type": "number", "description": "경도"}
                    },
                    "required": ["lat", "lng"]
                },
                "minItems": 2,
                "description": "사용자 정보 리스트 (최소 2명)"
            },
            "radius": {"type": "integer", "default": 1000, "description": "검색 반경 (미터)"},
            "cuisine": {"type": "string", "description": "선호 요리 키워드"},
            "max_results": {"type": "integer", "default": 15, "description": "결과 개수 제한"}
        },
        "required": ["users"]
    }
}

# MCP 도구 목록
MCP_TOOLS = [MCP_TOOL_SCHEMA]

# 기본 응답 형식
DEFAULT_RESPONSE_FORMAT = {
    "ai_response": "",
    "midpoint": {
        "lat": 0.0, 
        "lng": 0.0,
        "address": "",
        "road_address": "",
        "jibun_address": "",
        "region1": "",
        "region2": "",
        "region3": ""
    },
    "users": [],
    "restaurants": [],
    "source_stats": {"kakao": 0, "naver": 0, "total": 0},
    "query": "",
    "total_found": 0,
    "returned": 0
}
