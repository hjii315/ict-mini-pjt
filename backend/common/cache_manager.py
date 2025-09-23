#!/usr/bin/env python3
"""
캐시 관리 모듈
Redis를 이용한 캐시 시스템을 제공합니다.
"""

import json
import hashlib
import logging
import os
from typing import Any, Dict, List, Optional, Union
from datetime import datetime, timedelta
from functools import wraps

logger = logging.getLogger(__name__)

# Redis 의존성 체크
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    logger.warning("Redis 모듈이 설치되지 않았습니다. pip install redis를 실행하세요.")


class CacheManager:
    """Redis 기반 캐시 관리자"""
    
    def __init__(self, host: str = "localhost", port: int = 6379, db: int = 0, 
                 password: Optional[str] = None, decode_responses: bool = True,
                 enabled: bool = True):
        """함수명: CacheManager.__init__
        기능: Redis 연결을 초기화합니다.
        요청 파라미터(예시):
          host="localhost", port=6379, db=0, password=None, enabled=True
        응답 파라미터(예시):
          - 없음 (인스턴스 내부 상태 설정)
        """
        self.enabled = enabled and REDIS_AVAILABLE
        
        if not self.enabled:
            logger.info("캐시가 비활성화되었습니다.")
            self.redis_client = None
            self.connected = False
            return
            
        try:
            self.redis_client = redis.Redis(
                host=host,
                port=port,
                db=db,
                password=password,
                decode_responses=decode_responses,
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            # 연결 테스트
            self.redis_client.ping()
            self.connected = True
            logger.info("✅ Redis 캐시 연결 성공")
        except Exception as e:
            logger.warning(f"⚠️ Redis 연결 실패: {e}")
            self.redis_client = None
            self.connected = False
    
    def _generate_key(self, prefix: str, *args) -> str:
        """함수명: _generate_key
        기능: 캐시 키를 생성합니다.
        요청 파라미터(예시):
          prefix="restaurant", lat=37.5665, lng=126.9780, radius=1500
        응답 파라미터(예시):
          "restaurant:37.5665:126.9780:1500"
        """
        key_parts = [prefix] + [str(arg) for arg in args]
        return ":".join(key_parts)
    
    def _generate_hash_key(self, prefix: str, data: Dict[str, Any]) -> str:
        """함수명: _generate_hash_key
        기능: 복잡한 데이터를 해시하여 캐시 키를 생성합니다.
        요청 파라미터(예시):
          prefix="search", data={"users": [...], "cuisine": "한식"}
        응답 파라미터(예시):
          "search:a1b2c3d4e5f6..."
        """
        data_str = json.dumps(data, sort_keys=True, ensure_ascii=False)
        hash_obj = hashlib.md5(data_str.encode())
        return f"{prefix}:{hash_obj.hexdigest()}"
    
    def get(self, key: str) -> Optional[Any]:
        """함수명: get
        기능: 캐시에서 데이터를 조회합니다.
        요청 파라미터(예시):
          key="restaurant:37.5665:126.9780:1500"
        응답 파라미터(예시):
          {"restaurants": [...], "timestamp": "2024-01-01T12:00:00"}
        """
        if not self.enabled or not self.connected:
            return None
        
        try:
            data = self.redis_client.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.error(f"캐시 조회 오류: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """함수명: set
        기능: 캐시에 데이터를 저장합니다.
        요청 파라미터(예시):
          key="restaurant:37.5665:126.9780:1500", value={...}, ttl=3600
        응답 파라미터(예시):
          True (성공) 또는 False (실패)
        """
        if not self.enabled or not self.connected:
            return False
        
        try:
            data = json.dumps(value, ensure_ascii=False, default=str)
            return self.redis_client.setex(key, ttl, data)
        except Exception as e:
            logger.error(f"캐시 저장 오류: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """함수명: delete
        기능: 캐시에서 데이터를 삭제합니다.
        요청 파라미터(예시):
          key="restaurant:37.5665:126.9780:1500"
        응답 파라미터(예시):
          True (성공) 또는 False (실패)
        """
        if not self.enabled or not self.connected:
            return False
        
        try:
            return bool(self.redis_client.delete(key))
        except Exception as e:
            logger.error(f"캐시 삭제 오류: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """함수명: delete_pattern
        기능: 패턴에 맞는 캐시 키들을 삭제합니다.
        요청 파라미터(예시):
          pattern="restaurant:*"
        응답 파라미터(예시):
          5 (삭제된 키 개수)
        """
        if not self.enabled or not self.connected:
            return 0
        
        try:
            keys = self.redis_client.keys(pattern)
            if keys:
                return self.redis_client.delete(*keys)
            return 0
        except Exception as e:
            logger.error(f"패턴 캐시 삭제 오류: {e}")
            return 0
    
    def get_stats(self) -> Dict[str, Any]:
        """함수명: get_stats
        기능: 캐시 통계 정보를 반환합니다.
        요청 파라미터(예시):
          - 없음
        응답 파라미터(예시):
          {"connected": true, "keys": 150, "memory": "2.5MB"}
        """
        if not self.enabled:
            return {"connected": False, "enabled": False, "reason": "캐시가 비활성화됨"}
        
        if not self.connected:
            return {"connected": False, "enabled": True, "reason": "Redis 연결 실패"}
        
        try:
            info = self.redis_client.info()
            return {
                "connected": True,
                "enabled": True,
                "keys": info.get("db0", {}).get("keys", 0),
                "memory": f"{info.get('used_memory_human', '0B')}",
                "hits": info.get("keyspace_hits", 0),
                "misses": info.get("keyspace_misses", 0)
            }
        except Exception as e:
            logger.error(f"캐시 통계 조회 오류: {e}")
            return {"connected": False, "enabled": True, "error": str(e)}


def cache_result(prefix: str, ttl: int = 3600, key_func: Optional[callable] = None, enabled: bool = True):
    """함수명: cache_result
    기능: 함수 결과를 캐시하는 데코레이터입니다.
    요청 파라미터(예시):
      @cache_result("restaurant", ttl=1800, enabled=True)
      def search_restaurants(lat, lng, radius):
          ...
    응답 파라미터(예시):
      - 데코레이터가 적용된 함수의 결과
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 캐시가 비활성화된 경우 바로 함수 실행
            if not enabled:
                return await func(*args, **kwargs)
            
            # 캐시 매니저 인스턴스 가져오기
            cache_manager = getattr(wrapper, '_cache_manager', None)
            if not cache_manager:
                cache_manager = CacheManager(enabled=enabled)
                wrapper._cache_manager = cache_manager
            
            # 캐시 키 생성
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                cache_key = cache_manager._generate_key(prefix, *args, *kwargs.values())
            
            # 캐시에서 조회
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                logger.info(f"🎯 캐시 히트: {cache_key}")
                return cached_result
            
            # 캐시 미스 - 함수 실행
            logger.info(f"💾 캐시 미스: {cache_key}")
            result = await func(*args, **kwargs)
            
            # 결과 캐시 저장
            cache_manager.set(cache_key, result, ttl)
            logger.info(f"💾 캐시 저장: {cache_key}")
            
            return result
        return wrapper
    return decorator


# 환경변수에서 캐시 설정 읽기
CACHE_ENABLED = os.getenv("CACHE_ENABLED", "true").lower() == "true"

# 전역 캐시 매니저 인스턴스
cache_manager = CacheManager(enabled=CACHE_ENABLED)
