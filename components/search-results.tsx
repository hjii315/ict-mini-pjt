"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ZoomIn, ZoomOut, Navigation, Star, Clock, MapPin } from "lucide-react"
import { StepNavigation } from "@/components/step-navigation"
import { MapLoadingSkeleton, ApiErrorState, EmptyPlacesState } from "@/components/loading-states"

export function SearchResults() {
  const [sortBy, setSortBy] = useState<"distance" | "rating">("distance")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const places = [
    {
      id: 1,
      name: "카페 드롭탑",
      category: "카페",
      rating: 4.5,
      image: "/modern-cafe-interior.png",
      distance: "중심지에서 0.8km",
      travelTimes: { A: "15분", B: "12분", C: "18분" },
    },
    {
      id: 2,
      name: "미정국수 홍대점",
      category: "한식",
      rating: 4.2,
      image: "/korean-restaurant-interior.png",
      distance: "중심지에서 1.2km",
      travelTimes: { A: "18분", B: "15분", C: "22분" },
    },
    {
      id: 3,
      name: "브런치 카페 모모",
      category: "양식",
      rating: 4.7,
      image: "/brunch-cafe-interior.jpg",
      distance: "중심지에서 0.5km",
      travelTimes: { A: "12분", B: "8분", C: "15분" },
    },
    {
      id: 4,
      name: "스타벅스 홍대입구점",
      category: "카페",
      rating: 4.1,
      image: "/starbucks-interior.jpg",
      distance: "중심지에서 1.5km",
      travelTimes: { A: "20분", B: "18분", C: "25분" },
    },
    {
      id: 5,
      name: "이태리 부엌",
      category: "양식",
      rating: 4.4,
      image: "/italian-restaurant-interior.png",
      distance: "중심지에서 0.9km",
      travelTimes: { A: "16분", B: "13분", C: "19분" },
    },
    {
      id: 6,
      name: "떡볶이 명가",
      category: "한식",
      rating: 4.3,
      image: "/korean-street-food-restaurant.jpg",
      distance: "중심지에서 1.1km",
      travelTimes: { A: "17분", B: "14분", C: "21분" },
    },
  ]

  const sortedPlaces = [...places].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating
    }
    const aDistance = Number.parseFloat(a.distance.match(/[\d.]+/)?.[0] || "0")
    const bDistance = Number.parseFloat(b.distance.match(/[\d.]+/)?.[0] || "0")
    return aDistance - bDistance
  })

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)
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
            <h1 className="text-xl font-bold text-gray-800">추천 장소</h1>
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

                <div className="h-full">
                  <MapLoadingSkeleton />
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
              ) : places.length === 0 ? (
                <div className="bg-white/95 backdrop-blur-sm rounded-lg">
                  <EmptyPlacesState />
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedPlaces.map((place) => (
                    <Card
                      key={place.id}
                      className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="flex-shrink-0">
                            <img
                              src={place.image || "/placeholder.svg"}
                              alt={place.name}
                              className="w-24 h-20 object-cover rounded-lg"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-gray-800 text-lg">{place.name}</h3>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {place.category}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-sm font-medium text-gray-700">{place.rating}/5.0</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-gray-600 mb-2">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{place.distance}</span>
                            </div>

                            <div className="flex items-center gap-1 text-gray-600 mb-3">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">
                                A: {place.travelTimes.A}, B: {place.travelTimes.B}, C: {place.travelTimes.C}
                              </span>
                            </div>

                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                            >
                              선택하기
                            </Button>
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
