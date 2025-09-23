"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Navigation, Calculator, Plus, Minus, User } from "lucide-react"
import { StepNavigation } from "@/components/step-navigation"

export function MeetingPlaceApp() {
  const [participants, setParticipants] = useState(["", "", ""])

  const addParticipant = () => {
    if (participants.length < 10) {
      setParticipants([...participants, ""])
    }
  }

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index))
    }
  }

  const updateParticipant = (index: number, value: string) => {
    const updated = [...participants]
    updated[index] = value
    setParticipants(updated)
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
                        placeholder="예: 홍대입구역, 강남구 역삼동"
                        value={participant}
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

            <div className="pt-6">
              <Link href="/search">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  🎯 장소 추천받기
                </Button>
              </Link>
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
