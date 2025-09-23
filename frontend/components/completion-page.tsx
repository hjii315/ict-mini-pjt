"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  CheckCircle,
  MapPin,
  Users,
  Calendar,
  MessageCircle,
  MessageSquare,
  QrCode,
  Navigation,
  Phone,
  CalendarPlus,
  Star,
  Sparkles,
  ArrowLeft,
  LinkIcon,
} from "lucide-react"
import { StepNavigation } from "@/components/step-navigation"

export default function CompletionPage() {
  const [rating, setRating] = useState(0)
  const [showConfetti, setShowConfetti] = useState(true)

  const handleShare = (platform: string) => {
    console.log(`[v0] Sharing to ${platform}`)
    // Sharing logic would go here
  }

  const handleRating = (stars: number) => {
    setRating(stars)
    console.log(`[v0] User rated ${stars} stars`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      <StepNavigation currentStep={4} />

      {/* Confetti Animation Placeholder */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10">
          <div className="absolute top-10 left-10 text-yellow-400 animate-bounce">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="absolute top-20 right-20 text-green-400 animate-bounce delay-100">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="absolute top-32 left-1/3 text-purple-400 animate-bounce delay-200">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="absolute top-16 right-1/3 text-blue-400 animate-bounce delay-300">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Back Button */}
        <a href="/calculator" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </a>

        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-pulse">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">모임 준비 완료!</h1>
          <p className="text-lg text-gray-600">완벽한 만남을 위한 모든 준비가 끝났어요</p>
        </div>

        {/* Summary Card */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/modern-cafe-interior.png" alt="선택된 장소" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">카페 모임</h3>
                  <Badge className="bg-green-100 text-green-800 border-green-200">모든 정보 확인됨</Badge>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>서울시 강남구 역삼동 123-45</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>2024년 1월 15일 오후 2시</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>참석자 4명 • 1인당 15,000원</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sharing Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">친구들에게 공유하기</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleShare("kakao")}
              className="h-14 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-medium"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              카카오톡
            </Button>
            <Button
              onClick={() => handleShare("sms")}
              className="h-14 bg-blue-500 hover:bg-blue-600 text-white font-medium"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              SMS
            </Button>
            <Button
              onClick={() => handleShare("link")}
              variant="outline"
              className="h-14 border-2 hover:bg-gray-50 font-medium"
            >
              <LinkIcon className="w-5 h-5 mr-2" />
              링크 복사
            </Button>
            <Button
              onClick={() => handleShare("qr")}
              className="h-14 bg-purple-500 hover:bg-purple-600 text-white font-medium"
            >
              <QrCode className="w-5 h-5 mr-2" />
              QR코드 생성
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="grid grid-cols-1 gap-3">
            <Button
              variant="outline"
              className="h-12 justify-start border-2 hover:bg-blue-50 hover:border-blue-200 bg-transparent"
            >
              <Navigation className="w-5 h-5 mr-3 text-blue-600" />
              길찾기
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start border-2 hover:bg-green-50 hover:border-green-200 bg-transparent"
            >
              <Phone className="w-5 h-5 mr-3 text-green-600" />
              전화걸기
            </Button>
            <Button
              variant="outline"
              className="h-12 justify-start border-2 hover:bg-purple-50 hover:border-purple-200 bg-transparent"
            >
              <CalendarPlus className="w-5 h-5 mr-3 text-purple-600" />
              일정에 추가
            </Button>
          </div>
        </div>

        {/* Footer Section */}
        <div className="text-center space-y-6">
          <a href="/">
            <Button variant="outline" className="w-full h-12 border-2 font-medium bg-transparent">
              새로운 모임 계획하기
            </Button>
          </a>

          {/* Rating Section */}
          <Card className="bg-white/60 backdrop-blur-sm border-0">
            <CardContent className="p-4">
              <p className="text-sm text-gray-700 mb-3">앱이 도움이 되었나요?</p>
              <div className="flex justify-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && <p className="text-xs text-green-600 font-medium">평가해주셔서 감사합니다!</p>}
            </CardContent>
          </Card>

          <p className="text-xs text-gray-500">이용해주셔서 감사합니다</p>
        </div>
      </div>
    </div>
  )
}
