"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { StepNavigation } from "@/components/step-navigation"
import { MapLoadingSkeleton, ApiErrorState, EmptyPlacesState } from "@/components/loading-states"
import { MapSection } from "@/components/map/map-section"
import { KakaoMap } from "@/components/map/kakao-map"
import { RestaurantList } from "@/components/restaurant/restaurant-list"
import type { RecommendationResponse, Restaurant } from "@/services/api"

interface SearchParams {
  participants: Array<{ address: string }>
  radius: number
  cuisine: string
}

export function SearchResults() {
  const [sortBy, setSortBy] = useState<"distance" | "rating">("distance")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<RecommendationResponse | null>(null)
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null)

  useEffect(() => {
    const loadSearchResults = () => {
      try {
        const resultsData = sessionStorage.getItem("searchResults")
        const paramsData = sessionStorage.getItem("searchParams")

        if (resultsData && paramsData) {
          setSearchResults(JSON.parse(resultsData))
          setSearchParams(JSON.parse(paramsData))
        } else {
          setError("검색 결과를 찾을 수 없습니다. 다시 검색해 주세요.")
        }
      } catch (err) {
        console.error("Failed to load search results:", err)
        setError("검색 결과를 불러오는 중 오류가 발생했습니다.")
      } finally {
        setIsLoading(false)
      }
    }
    loadSearchResults()
  }, [])

  const restaurants = searchResults?.restaurants || []

  function getMockRating(restaurant: Restaurant) {
    const hash = restaurant.place_name.split("").reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return (3.5 + (Math.abs(hash) % 20) / 10).toFixed(1)
  }

  const sortedPlaces = [...restaurants].sort((a, b) => {
    if (sortBy === "rating") {
      const ra = parseFloat(getMockRating(a))
      const rb = parseFloat(getMockRating(b))
      return rb - ra
    }
    const getDistance = (restaurant: Restaurant) => {
      const distanceMatch = restaurant.distance?.match(/[\d.]+/)
      return distanceMatch ? parseFloat(distanceMatch[0]) : 0
    }
    return getDistance(a) - getDistance(b)
  })

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    window.location.href = "/"
  }

  const formatDistance = (distance: string) => {
    if (!distance) return "거리 정보 없음"
    const match = distance.match(/[\d.]+/)
    if (match) {
      const meters = parseFloat(match[0])
      if (meters >= 1000) return `${(meters / 1000).toFixed(1)}km`
      return `${Math.round(meters)}m`
    }
    return distance
  }

  const getMockTravelTimes = (participants: Array<{ address: string }>) =>
    participants.map(() => `${Math.round(10 + Math.random() * 15)}분`)

  const formatMidpointAddress = (midpoint: any) => {
    if (midpoint.address?.trim()) return midpoint.address
    if (midpoint.road_address?.trim()) return midpoint.road_address
    if (midpoint.jibun_address?.trim()) return midpoint.jibun_address
    if (midpoint.region1 || midpoint.region2 || midpoint.region3) {
      const regions = [midpoint.region1, midpoint.region2, midpoint.region3]
        .filter((r: string) => r?.trim())
        .join(" ")
      if (regions) return regions
    }
    if (midpoint.lat && midpoint.lng) return `${midpoint.lat}, ${midpoint.lng}`
    return "계산된 중간지점"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600">
        <StepNavigation currentStep={2} />
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <MapLoadingSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600">
      <StepNavigation currentStep={2} />

      <div className="bg-white/95 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex-1 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800">추천 장소</h1>
              {searchResults && (
                <div className="text-xl font-bold text-gray-800 text-right truncate max-w-[70%]">
                  {formatMidpointAddress(searchResults.midpoint)}
                </div>
              )}
            </div>
          </div>
          {searchResults && (
            <p className="text-sm text-gray-600 mt-1">{searchResults.returned}개 장소 발견</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 지도 영역: 스크롤 시 고정 */}
          <div className="order-2 lg:order-1 lg:sticky lg:top-24 self-start">
            <MapSection title="지도">
              {searchResults ? (
                <KakaoMap midpoint={searchResults.midpoint} restaurants={restaurants} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <MapLoadingSkeleton />
                </div>
              )}
            </MapSection>
          </div>

          {/* 리스트 영역 */}
          <div className="order-1 lg:order-2">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">추천 장소 목록</h2>
                <div className="flex gap-2">
                  <Button
                    variant={sortBy === "distance" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("distance")}
                    className={
                      sortBy === "distance"
                        ? "bg-white text-purple-600 hover:bg-white/90"
                        : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                    }
                  >
                    거리순
                  </Button>
                  <Button
                    variant={sortBy === "rating" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSortBy("rating")}
                    className={
                      sortBy === "rating"
                        ? "bg-white text-purple-600 hover:bg-white/90"
                        : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                    }
                  >
                    평점순
                  </Button>
                </div>
              </div>

              {error ? (
                <Card className="bg-white/95 backdrop-blur-sm border-0">
                  <ApiErrorState onRetry={handleRetry} />
                </Card>
              ) : restaurants.length === 0 ? (
                <Card className="bg-white/95 backdrop-blur-sm border-0">
                  <EmptyPlacesState />
                </Card>
              ) : (
                <RestaurantList
                  restaurants={sortedPlaces}
                  formatDistance={formatDistance}
                  getMockRating={getMockRating}
                  travelTimes={searchParams ? getMockTravelTimes(searchParams.participants) : undefined}
                />
              )}
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-white/20">
          <div className="container mx-auto max-w-7xl">
            <Link href="/calculator">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                정산 계산하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}