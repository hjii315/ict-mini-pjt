import { StepNavigation } from "@/components/step-navigation"
import { LoadingSpinner } from "@/components/loading-states"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      <StepNavigation currentStep={4} />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" disabled>
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">결과를 준비하고 있어요!</h1>
          <p className="text-lg text-gray-600">잠시만 기다려주세요</p>
        </div>

        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-8">
          <LoadingSpinner message="완료 페이지를 준비하고 있어요..." />
        </div>
      </div>
    </div>
  )
}
