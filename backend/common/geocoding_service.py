#!/usr/bin/env python3
"""
역지오코딩 서비스 모듈
위경도 좌표를 주소로 변환하는 기능을 제공합니다.
"""

import requests
import os
import asyncio
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class GeocodingService:
    """역지오코딩 서비스 클래스"""
    
    def __init__(self):
        self.kakao_api_key = os.getenv('KAKAO_API_KEY')
        self.naver_client_id = os.getenv('NAVER_CLIENT_ID')
        self.naver_client_secret = os.getenv('NAVER_CLIENT_SECRET')
    
    async def reverse_geocode_kakao(self, lat: float, lng: float) -> Optional[Dict]:
        """카카오 API를 사용한 역지오코딩"""
        if not self.kakao_api_key:
            logger.warning("카카오 API 키가 설정되지 않았습니다.")
            return None
            
        url = f"https://dapi.kakao.com/v2/local/geo/coord2address.json?x={lng}&y={lat}"
        headers = {'Authorization': f'KakaoAK {self.kakao_api_key}'}
        
        try:
            response = requests.get(url, headers=headers, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            if data.get('documents') and len(data['documents']) > 0:
                doc = data['documents'][0]
                address = doc.get('address', {})
                road_address = doc.get('road_address', {})
                
                return {
                    'address': road_address.get('address_name', '') or address.get('address_name', ''),
                    'road_address': road_address.get('address_name', ''),
                    'jibun_address': address.get('address_name', ''),
                    'region1': address.get('region_1depth_name', ''),
                    'region2': address.get('region_2depth_name', ''),
                    'region3': address.get('region_3depth_name', ''),
                    'provider': 'kakao'
                }
        except Exception as e:
            logger.error(f"카카오 역지오코딩 실패: {e}")
        
        return None
    
    async def reverse_geocode_naver(self, lat: float, lng: float) -> Optional[Dict]:
        """네이버 API를 사용한 역지오코딩"""
        if not self.naver_client_id or not self.naver_client_secret:
            logger.warning("네이버 API 키가 설정되지 않았습니다.")
            return None
            
        url = f"https://naveropenapi.apigw.ntruss.com/map-reversegeocode/v2/gc?coords={lng},{lat}&output=json"
        headers = {
            'X-NCP-APIGW-API-KEY-ID': self.naver_client_id,
            'X-NCP-APIGW-API-KEY': self.naver_client_secret
        }
        
        try:
            response = requests.get(url, headers=headers, timeout=5)
            response.raise_for_status()
            data = response.json()
            
            if data.get('results') and len(data['results']) > 0:
                result = data['results'][0]
                land = result.get('land', {})
                region = result.get('region', {})
                
                region1 = region.get('area1', {}).get('name', '')
                region2 = region.get('area2', {}).get('name', '')
                region3 = region.get('area3', {}).get('name', '')
                
                road_address = land.get('name', '')
                jibun_address = f"{region1} {region2} {region3}".strip()
                
                return {
                    'address': road_address or jibun_address,
                    'road_address': road_address,
                    'jibun_address': jibun_address,
                    'region1': region1,
                    'region2': region2,
                    'region3': region3,
                    'provider': 'naver'
                }
        except Exception as e:
            logger.error(f"네이버 역지오코딩 실패: {e}")
        
        return None
    
    async def reverse_geocode(self, lat: float, lng: float) -> Dict:
        """위경도를 주소로 변환 (카카오 우선, 실패 시 네이버)"""
        # 카카오 API 시도
        result = await self.reverse_geocode_kakao(lat, lng)
        
        # 카카오 실패 시 네이버 API 시도
        if not result:
            result = await self.reverse_geocode_naver(lat, lng)
        
        # 모든 API 실패 시 기본값 반환
        if not result:
            logger.warning(f"주소 변환 실패: ({lat}, {lng})")
            return {
                'address': f"위도: {lat:.6f}, 경도: {lng:.6f}",
                'road_address': '',
                'jibun_address': '',
                'region1': '',
                'region2': '',
                'region3': '',
                'provider': 'none'
            }
        
        return result

# 전역 인스턴스
geocoding_service = GeocodingService()
