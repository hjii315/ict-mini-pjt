"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Users, Calculator, Share2, Copy, RotateCcw, ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"
import { StepNavigation } from "@/components/step-navigation"

export default function BillCalculator() {
  const [totalAmount, setTotalAmount] = useState("")
  const [participants, setParticipants] = useState(4)
  const [selectedTip, setSelectedTip] = useState("none")
  const [customTip, setCustomTip] = useState("")
  const [roundingMethod, setRoundingMethod] = useState("round")
  const [showHistory, setShowHistory] = useState(false)

  // Mock restaurant data (would come from previous page)
  const selectedRestaurant = {
    name: "맛있는 한식당",
    address: "서울시 강남구 역삼동 123-45",
    priceRange: "15,000원 ~ 25,000원",
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ko-KR").format(amount)
  }

  const calculateTip = () => {
    const amount = Number.parseFloat(totalAmount.replace(/,/g, "")) || 0
    if (selectedTip === "none") return 0
    if (selectedTip === "custom") return Number.parseFloat(customTip) || 0
    return amount * (Number.parseFloat(selectedTip) / 100)
  }

  const calculatePerPerson = () => {
    const amount = Number.parseFloat(totalAmount.replace(/,/g, "")) || 0
    const tip = calculateTip()
    const total = amount + tip
    const perPerson = total / participants

    switch (roundingMethod) {
      case "ceil":
        return Math.ceil(perPerson)
      case "floor":
        return Math.floor(perPerson)
      default:
        return Math.round(perPerson)
    }
  }

  const handleAmountChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "")
    if (numericValue) {
      setTotalAmount(formatCurrency(Number.parseInt(numericValue)))
    } else {
      setTotalAmount("")
    }
  }

  const tipOptions = [
    { value: "none", label: "팁 없음" },
    { value: "5", label: "5%" },
    { value: "10", label: "10%" },
    { value: "custom", label: "직접입력" },
  ]

  const roundingOptions = [
    { value: "round", label: "반올림" },
    { value: "ceil", label: "올림" },
    { value: "floor", label: "내림" },
  ]

  const mockHistory = [
    { restaurant: "이탈리안 레스토랑", amount: 48000, people: 3, date: "2024-01-15" },
    { restaurant: "카페 브런치", amount: 32000, people: 4, date: "2024-01-10" },
    { restaurant: "한식당", amount: 60000, people: 5, date: "2024-01-05" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <StepNavigation currentStep={3} />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href="/search" className="inline-flex items-center text-gray-600 hover:text-gray-800 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Calculator className="w-8 h-8 text-blue-600" />💰 식사비 정산
          </h1>
        </div>

        {/* Selected Restaurant Info */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">{selectedRestaurant.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{selectedRestaurant.address}</p>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  예상 가격: {selectedRestaurant.priceRange}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculator Section */}
        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl text-gray-900">정산 계산기</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="total-amount" className="text-sm font-medium text-gray-700">
                총 결제 금액
              </Label>
              <div className="relative">
                <Input
                  id="total-amount"
                  type="text"
                  value={totalAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="50,000"
                  className="text-right text-xl font-semibold pr-12 h-14"
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  원
                </span>
              </div>
            </div>

            {/* Participants Count */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">참석자 수</Label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParticipants(Math.max(1, participants - 1))}
                  className="w-10 h-10 p-0"
                >
                  -
                </Button>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="font-semibold text-lg">{participants}명</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setParticipants(participants + 1)}
                  className="w-10 h-10 p-0"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Tip Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">팁 옵션</Label>
              <div className="grid grid-cols-2 gap-2">
                {tipOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={selectedTip === option.value ? "default" : "outline"}
                    onClick={() => setSelectedTip(option.value)}
                    className="h-12"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
              {selectedTip === "custom" && (
                <div className="relative">
                  <Input
                    type="text"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="직접 입력"
                    className="text-right pr-12"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">원</span>
                </div>
              )}
            </div>

            {/* Rounding Options */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-700">소수점 처리</Label>
              <div className="flex gap-2">
                {roundingOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={roundingMethod === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setRoundingMethod(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="mb-6 border-0 shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              <p className="text-blue-100 mb-2">1인당</p>
              <p className="text-4xl font-bold">{formatCurrency(calculatePerPerson())}원</p>
            </div>

            <Separator className="my-4 bg-white/20" />

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-100">총 금액:</span>
                <span>{totalAmount || "0"}원</span>
              </div>
              {calculateTip() > 0 && (
                <div className="flex justify-between">
                  <span className="text-blue-100">팁:</span>
                  <span>{formatCurrency(calculateTip())}원</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-blue-100">참석자:</span>
                <span>{participants}명</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-blue-100">개인 부담:</span>
                <span>{formatCurrency(calculatePerPerson())}원</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3 mb-6">
          <Link href="/complete">
            <Button className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-semibold text-lg">
              <Share2 className="w-5 h-5 mr-2" />
              정산 완료하기
            </Button>
          </Link>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 bg-transparent">
              <Copy className="w-4 h-4 mr-2" />
              링크 복사
            </Button>
            <Button variant="outline" className="h-12 bg-transparent">
              <RotateCcw className="w-4 h-4 mr-2" />
              새로운 계산
            </Button>
          </div>
        </div>

        {/* Calculation History */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <Button
              variant="ghost"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full justify-between p-0 h-auto"
            >
              <CardTitle className="text-lg text-gray-900">계산 히스토리</CardTitle>
              {showHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </CardHeader>
          {showHistory && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                {mockHistory.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.restaurant}</p>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(Math.round(item.amount / item.people))}원
                      </p>
                      <p className="text-sm text-gray-600">{item.people}명</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}
