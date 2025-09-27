"use client"

import { useEffect, useRef, useState } from "react"
import type { MidpointInfo, Restaurant } from "@/services/api"

declare global {
  interface Window {
    kakao: any
  }
}

interface Props {
  midpoint: MidpointInfo
  restaurants: Restaurant[]
  selected?: Restaurant
}

export function KakaoMap({ midpoint, restaurants, selected }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const tryLoad = () => {
      if (!window.kakao || !window.kakao.maps || !window.kakao.maps.load) {
        setTimeout(tryLoad, 100)
        return
      }
      window.kakao.maps.load(() => setIsReady(true))
    }
    try {
      tryLoad()
    } catch (e) {
      setError("카카오맵을 로드하는 중 오류가 발생했습니다.")
    }
  }, [])

  useEffect(() => {
    if (!isReady || !containerRef.current) return
    try {
      const { kakao } = window
      const center = new kakao.maps.LatLng(midpoint.lat, midpoint.lng)
      const map = new kakao.maps.Map(containerRef.current, {
        center,
        level: 5,
      })

      const bounds = new kakao.maps.LatLngBounds()
      bounds.extend(center)

      // Midpoint marker
      const midpointMarker = new kakao.maps.Marker({ position: center })
      midpointMarker.setMap(map)

      const midpointInfo = new kakao.maps.InfoWindow({
        content: `<div style="padding:6px 10px;">중간지점<br/>${midpoint.address || midpoint.road_address || midpoint.jibun_address || ""}</div>`,
      })
      kakao.maps.event.addListener(midpointMarker, "click", () => midpointInfo.open(map, midpointMarker))

      // Restaurant markers
      let selectedMarker: any | null = null
      let selectedInfo: any | null = null

      restaurants.forEach((r) => {
        const pos = new kakao.maps.LatLng(Number(r.place_y), Number(r.place_x))
        bounds.extend(pos)

        const marker = new kakao.maps.Marker({ position: pos })
        marker.setMap(map)

        const info = new kakao.maps.InfoWindow({
          content: `
            <div style="padding:6px 10px; max-width:240px;">
              <strong>${r.place_name}</strong><br/>
              <span style="font-size:12px;">${r.place_address || ""}</span><br/>
              <span style="font-size:11px;color:#6b7280;">위도: ${r.place_y}, 경도: ${r.place_x}</span><br/>
              ${r.place_url ? `<a href="${r.place_url}" target="_blank" style="font-size:12px; color:#3b82f6;">상세보기</a>` : ""}
            </div>
          `,
        })
        kakao.maps.event.addListener(marker, "click", () => info.open(map, marker))

        if (selected && selected.place_id === r.place_id) {
          selectedMarker = marker
          selectedInfo = info
        }
      })

      map.setBounds(bounds)

      if (selectedMarker && selectedInfo) {
        selectedInfo.open(map, selectedMarker)
        // 선택된 식당이 보이도록 중심 이동 및 확대
        map.setCenter(selectedMarker.getPosition())
        map.setLevel(4)
      }
    } catch (e) {
      setError("지도를 렌더링하는 중 오류가 발생했습니다.")
    }
  }, [isReady, midpoint, restaurants, selected])

  if (error) return <div className="h-full flex items-center justify-center text-red-600 text-sm">{error}</div>
  if (!isReady) return <div className="h-full flex items-center justify-center text-gray-500 text-sm">지도를 불러오는 중...</div>
  return <div ref={containerRef} className="w-full h-full rounded-lg" />
}
