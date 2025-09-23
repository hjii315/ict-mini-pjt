"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ZoomIn, ZoomOut, Navigation, Star, Clock, MapPin, Phone, ExternalLink } from "lucide-react"
import { StepNavigation } from "@/components/step-navigation"
import { MapLoadingSkeleton, ApiErrorState, EmptyPlacesState } from "@/components/loading-states"
import { RecommendationResponse, Restaurant } from "@/services/api"

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
    // Load search results from sessionStorage
    const loadSearchResults = () => {
      try {
        const resultsData = sessionStorage.getItem('searchResults')
        const paramsData = sessionStorage.getItem('searchParams')
        
        if (resultsData && paramsData) {
          setSearchResults(JSON.parse(resultsData))
          setSearchParams(JSON.parse(paramsData))
        } else {
          setError('검색 결과를 찾을 수 없습니다. 다시 검색해 주세요.')
        }
      } catch (err) {
        console.error('Failed to load search results:', err)
        setError('검색 결과를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadSearchResults()
  }, [])

  const restaurants = searchResults?.restaurants || []

  const sortedPlaces = [...restaurants].sort((a, b) => {
    if (sortBy === "rating") {
      // Extract rating from place_category or use a default rating system
      const getRating = (restaurant: Restaurant) => {
        // Since the API doesn't provide ratings, we'll use a mock rating based on source
        return restaurant.source === 'kakao' ? 4.2 : 4.0
      }
      return getRating(b) - getRating(a)
    }
    
    // Sort by distance (convert distance string to number)
    const getDistance = (restaurant: Restaurant) => {
      const distanceMatch = restaurant.distance.match(/[\d.]+/)
      return distanceMatch ? parseFloat(distanceMatch[0]) : 0
    }
    
    return getDistance(a) - getDistance(b)
  })

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    // Reload the page to trigger a new search
    window.location.href = '/'
  }

  const formatDistance = (distance: string) => {
    if (!distance) return '거리 정보 없음'
    const match = distance.match(/[\d.]+/)
    if (match) {
      const meters = parseFloat(match[0])
      if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)}km`
      }
      return `${Math.round(meters)}m`
    }
    return distance
  }

  const getMockRating = (restaurant: Restaurant) => {
    // Generate a consistent mock rating based on restaurant name
    const hash = restaurant.place_name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return (3.5 + (Math.abs(hash) % 20) / 10).toFixed(1)
  }

  const getMockTravelTimes = (participants: Array<{ address: string }>) => {
    // Generate mock travel times for each participant
    return participants.map((_, index) => {
      const baseTime = 10 + Math.random() * 15 // 10-25 minutes
      return `${Math.round(baseTime)}분`
    })
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
            <div>
              <h1 className="text-xl font-bold text-gray-800">추천 장소</h1>
              {searchResults && (
                <p className="text-sm text-gray-600">
                  {searchResults.returned}개 장소 발견 • 중심지: {searchResults.midpoint.address || '계산된 중간지점'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="order-2 lg:order-1">
            <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl h-[500px] lg:h-[700px]">
              <CardContent className="p-6 h-full">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">지도</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="p-2 bg-transparent">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="p-2 bg-transparent">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="p-2 bg-transparent">
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="h-full bg-gray-100 rounded-lg flex items-center justify-center">
                  {searchResults ? (
                    <div className="text-center p-6">
                      <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">지도 영역</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        중심지: {searchResults.midpoint.lat.toFixed(4)}, {searchResults.midpoint.lng.toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-400">
                        실제 구현 시 카카오맵 API를 연동하여<br />
                        추천 장소들을 지도에 표시합니다
                      </p>
                    </div>
                  ) : (
                    <MapLoadingSkeleton />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

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
                <div className="bg-white/95 backdrop-blur-sm rounded-lg">
                  <ApiErrorState onRetry={handleRetry} />
                </div>
              ) : restaurants.length === 0 ? (
                <div className="bg-white/95 backdrop-blur-sm rounded-lg">
                  <EmptyPlacesState />
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedPlaces.map((restaurant) => (
                    <Card
                      key={restaurant.place_id}
                      className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <img
                              src={restaurant.image_url || "/placeholder.svg"}
                              alt={restaurant.place_name}
                              className="w-24 h-20 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/placeholder.svg"
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-800 text-lg">{restaurant.place_name}</h3>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {restaurant.place_category || '음식점'}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-sm font-medium text-gray-700">{getMockRating(restaurant)}/5.0</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-gray-600 mb-2">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{restaurant.place_address}</span>
                            </div>

                            <div className="flex items-center gap-1 text-gray-600 mb-2">
                              <Navigation className="h-4 w-4" />
                              <span className="text-sm">중심지에서 {formatDistance(restaurant.distance)}</span>
                            </div>

                            {restaurant.place_phone && (
                              <div className="flex items-center gap-1 text-gray-600 mb-2">
                                <Phone className="h-4 w-4" />
                                <span className="text-sm">{restaurant.place_phone}</span>
                              </div>
                            )}

                            {searchParams && (
                              <div className="flex items-center gap-1 text-gray-600 mb-3">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">
                                  예상 소요시간: {getMockTravelTimes(searchParams.participants).join(', ')}
                                </span>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                              >
                                선택하기
                              </Button>
                              {restaurant.place_url && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(restaurant.place_url, '_blank')}
                                  className="border-gray-300"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  상세보기
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                💰 정산 계산하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
