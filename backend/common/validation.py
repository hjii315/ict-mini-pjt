#!/usr/bin/env python3
"""
공통 검증 유틸리티 모듈
서버와 클라이언트에서 공통으로 사용하는 검증 로직을 제공합니다.
"""

from typing import Dict, Any, List, Tuple, Optional
from fastapi import HTTPException


def validate_users(users: List[Dict[str, Any]], field_name: str = "users") -> List[Dict[str, Any]]:
    """함수명: validate_users
    기능: 사용자 정보 리스트를 검증하고 정규화합니다 (latitude/longitude와 lat/lng 형식 모두 지원).
    요청 파라미터(예시):
      users = [
        {"lat": 37.5665, "lng": 126.9780},
        {"latitude": 37.3943, "longitude": 127.1107}
      ]
      field_name = "users"
    응답 파라미터(예시):
      [{"lat": 37.5665, "lng": 126.9780}, {"lat": 37.3943, "lng": 127.1107}]
    """
    if not users or not isinstance(users, list) or len(users) < 2:
        raise HTTPException(
            status_code=400, 
            detail=f"{field_name}는 최소 2명의 사용자 정보가 필요합니다"
        )
    
    validated_users = []
    for i, user in enumerate(users):
        if not isinstance(user, dict):
            raise HTTPException(
                status_code=400, 
                detail=f"사용자 {i+1} 정보가 올바르지 않습니다"
            )
        
        # latitude/longitude 또는 lat/lng 형식 모두 처리
        lat = user.get("latitude") or user.get("lat")
        lng = user.get("longitude") or user.get("lng")
        
        if lat is None or lng is None:
            raise HTTPException(
                status_code=400, 
                detail=f"사용자 {i+1} 정보에 lat, lng 또는 latitude, longitude가 필요합니다"
            )
        
        # 숫자 타입 검증
        try:
            validated_users.append({"lat": float(lat), "lng": float(lng)})
        except (ValueError, TypeError):
            raise HTTPException(
                status_code=400, 
                detail=f"사용자 {i+1}의 좌표는 숫자여야 합니다"
            )
    
    return validated_users


def extract_search_parameters(arguments: Dict[str, Any]) -> Tuple[int, Optional[str], int]:
    """함수명: extract_search_parameters
    기능: 검색 파라미터를 추출하고 기본값을 적용합니다.
    요청 파라미터(예시):
      arguments = {
        "radius": 1500,
        "cuisine": "한식",
        "max_results": 5
      }
    응답 파라미터(예시):
      (1500, "한식", 5)
    """
    radius = int(arguments.get("radius", 1000))
    cuisine = arguments.get("cuisine")
    max_results = int(arguments.get("max_results") or arguments.get("limit", 15))
    
    return radius, cuisine, max_results
