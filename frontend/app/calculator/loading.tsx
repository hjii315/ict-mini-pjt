import { StepNavigation } from "@/components/step-navigation"
import { LoadingSpinner } from "@/components/loading-states"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Calculator } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <StepNavigation currentStep={3} />

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-6" disabled>
          <ArrowLeft className="w-4 h-4 mr-2" />
          돌아가기
        </Button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
            <Calculator className="w-8 h-8 text-blue-600" />💰 식사비 정산
          </h1>
        </div>

        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3"></div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
              <div className="h-14 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4"></div>
              <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center py-8">
          <LoadingSpinner message="계산기를 준비하고 있어요..." />
        </div>
      </div>
    </div>
  )
}
