#!/usr/bin/env python3
"""
설정 관리 모듈
환경변수와 기본 설정을 관리합니다.
"""

import os
from typing import Optional

class Config:
    """애플리케이션 설정 클래스"""
    
    # API 키 설정
    KAKAO_API_KEY: Optional[str] = "YOUR_API_KEY"
    NAVER_CLIENT_ID: Optional[str] = "YOUR_CLIENT_ID"
    NAVER_CLIENT_SECRET: Optional[str] = "YOUR_CLIENT_SECRET"
    
    # 캐시 설정
    CACHE_ENABLED: bool = os.getenv("CACHE_ENABLED", "true").lower() == "true"
    REDIS_HOST: str = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    REDIS_PASSWORD: Optional[str] = os.getenv("REDIS_PASSWORD")
    
    # 서버 설정
    SERVER_HOST: str = os.getenv("SERVER_HOST", "0.0.0.0")
    SERVER_PORT: int = int(os.getenv("SERVER_PORT", "9000"))
    
    # 로그 설정
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_DIR: str = os.getenv("LOG_DIR", "./logs")
    
    @classmethod
    def validate_api_keys(cls) -> dict:
        """API 키 유효성을 검사합니다."""
        return {
            "kakao": bool(cls.KAKAO_API_KEY),
            "naver": bool(cls.NAVER_CLIENT_ID and cls.NAVER_CLIENT_SECRET),
            "cache": cls.CACHE_ENABLED
        }
    
    @classmethod
    def get_redis_config(cls) -> dict:
        """Redis 연결 설정을 반환합니다."""
        return {
            "host": cls.REDIS_HOST,
            "port": cls.REDIS_PORT,
            "db": cls.REDIS_DB,
            "password": cls.REDIS_PASSWORD,
            "enabled": cls.CACHE_ENABLED
        }

# 전역 설정 인스턴스
config = Config()
