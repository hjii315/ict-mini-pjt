"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Navigation, Calculator, Plus, Minus, User, Loader2 } from "lucide-react"
import { StepNavigation } from "@/components/step-navigation"
import { apiService, UserLocation } from "@/services/api"

interface ParticipantInput {
  address: string
  coordinates?: UserLocation
}

export function MeetingPlaceApp() {
  const router = useRouter()
  const [participants, setParticipants] = useState<ParticipantInput[]>([
    { address: "" },
    { address: "" },
    { address: "" }
  ])
  const [radius, setRadius] = useState<number>(1000)
  const [cuisine, setCuisine] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addParticipant = () => {
    if (participants.length < 10) {
      setParticipants([...participants, { address: "" }])
    }
  }

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index))
    }
  }

  const updateParticipant = (index: number, address: string) => {
    const updated = [...participants]
    updated[index] = { ...updated[index], address }
    setParticipants(updated)
  }

  // Mock geocoding function - in a real app, this would use Kakao Maps API
  const mockGeocode = (address: string): UserLocation | null => {
    // Sample coordinates for common Seoul locations
    const mockLocations: Record<string, UserLocation> = {
      "홍대입구역": { lat: 37.5563, lng: 126.9236 },
      "강남역": { lat: 37.4979, lng: 127.0276 },
      "신촌역": { lat: 37.5559, lng: 126.9364 },
      "이태원역": { lat: 37.5345, lng: 126.9947 },
      "명동역": { lat: 37.5636, lng: 126.9810 },
      "종로3가역": { lat: 37.5703, lng: 126.9925 },
      "서울역": { lat: 37.5547, lng: 126.9707 },
      "잠실역": { lat: 37.5133, lng: 127.1000 },
      "건대입구역": { lat: 37.5401, lng: 127.0695 },
      "성수역": { lat: 37.5446, lng: 127.0557 }
    }

    // Check for exact matches first
    for (const [key, coords] of Object.entries(mockLocations)) {
      if (address.includes(key.replace("역", ""))) {
        return coords
      }
    }

    // Generate random coordinates around Seoul for other addresses
    if (address.trim()) {
      return {
        lat: 37.5665 + (Math.random() - 0.5) * 0.1, // Seoul center ± 0.05 degrees
        lng: 126.9780 + (Math.random() - 0.5) * 0.1
      }
    }

    return null
  }

  const handleSearch = async () => {
    setError(null)
    setIsLoading(true)

    try {
      // Filter out empty addresses
      const validParticipants = participants.filter(p => p.address.trim())
      
      if (validParticipants.length < 2) {
        throw new Error("최소 2명의 참석자 주소가 필요합니다.")
      }

      // Convert addresses to coordinates
      const userLocations: UserLocation[] = []
      for (const participant of validParticipants) {
        const coords = mockGeocode(participant.address)
        if (coords) {
          userLocations.push(coords)
        } else {
          throw new Error(`주소를 찾을 수 없습니다: ${participant.address}`)
        }
      }

      // Call the backend API
      const recommendations = await apiService.getRestaurantRecommendations(
        userLocations,
        {
          radius,
          cuisine: cuisine || undefined,
          max_results: 15
        }
      )

      // Store the results in sessionStorage to pass to the search page
      sessionStorage.setItem('searchResults', JSON.stringify(recommendations))
      sessionStorage.setItem('searchParams', JSON.stringify({
        participants: validParticipants,
        radius,
        cuisine
      }))

      // Navigate to search results page
      router.push('/search')

    } catch (err) {
      console.error('Search failed:', err)
      setError(err instanceof Error ? err.message : '검색 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600">
      <StepNavigation currentStep={1} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <MapPin className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white text-balance">모임 장소 추천 AI</h1>
          </div>
          <p className="text-xl text-white/90 mb-8 text-pretty max-w-2xl mx-auto">
            친구들과의 완벽한 만남을 위한 원스톱 솔루션
          </p>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl w-fit">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">📍 최적 장소 찾기</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600 leading-relaxed">
                모든 친구들에게 공평한 중간 지점을 AI가 똑똑하게 찾아드려요
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl w-fit">
                <Navigation className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">🗺️ 실시간 지도</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600 leading-relaxed">
                카카오맵 연동으로 정확한 위치와 길찾기를 제공해드려요
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-3 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl w-fit">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800">💰 자동 정산</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-gray-600 leading-relaxed">
                식사비를 참석자 수로 나눠서 자동으로 계산해드려요
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Input Section */}
        <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800 mb-2">참석자 출발지 입력</CardTitle>
            <CardDescription className="text-gray-600">
              모든 참석자의 출발지를 입력하면 최적의 만남 장소를 추천해드려요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search Options */}
            <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="radius" className="text-sm font-medium text-gray-700 mb-2 block">
                  검색 반경
                </Label>
                <Select value={radius.toString()} onValueChange={(value) => setRadius(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="검색 반경 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">500m</SelectItem>
                    <SelectItem value="1000">1km</SelectItem>
                    <SelectItem value="1500">1.5km</SelectItem>
                    <SelectItem value="2000">2km</SelectItem>
                    <SelectItem value="3000">3km</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="cuisine" className="text-sm font-medium text-gray-700 mb-2 block">
                  선호 음식 (선택사항)
                </Label>
                <Select value={cuisine} onValueChange={setCuisine}>
                  <SelectTrigger>
                    <SelectValue placeholder="음식 종류 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체</SelectItem>
                    <SelectItem value="한식">한식</SelectItem>
                    <SelectItem value="중식">중식</SelectItem>
                    <SelectItem value="일식">일식</SelectItem>
                    <SelectItem value="양식">양식</SelectItem>
                    <SelectItem value="카페">카페</SelectItem>
                    <SelectItem value="치킨">치킨</SelectItem>
                    <SelectItem value="피자">피자</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Participants */}
            <div className="space-y-4">
              {participants.map((participant, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={`participant-${index}`} className="text-sm font-medium text-gray-700 mb-1 block">
                        참석자 {index + 1}
                      </Label>
                      <Input
                        id={`participant-${index}`}
                        placeholder="예: 홍대입구역, 강남역, 신촌역"
                        value={participant.address}
                        onChange={(e) => updateParticipant(index, e.target.value)}
                        className="bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {participants.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeParticipant(index)}
                        className="p-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                    {index === participants.length - 1 && participants.length < 10 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addParticipant}
                        className="p-2 border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 bg-transparent"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="pt-6">
              <Button
                size="lg"
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    장소 검색 중...
                  </>
                ) : (
                  "🎯 장소 추천받기"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-white/80 text-sm">© 2024 모임 장소 추천 AI. 친구들과의 즐거운 만남을 응원합니다! 🎉</p>
        </div>
      </div>
    </div>
  )
}
