import { StepNavigation } from "@/components/step-navigation"
import { LoadingSpinner, MapLoadingSkeleton, PlaceCardsLoadingSkeleton } from "@/components/loading-states"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ZoomIn, ZoomOut, Navigation } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-600">
      <StepNavigation currentStep={2} />

      <div className="bg-white/95 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" className="p-2" disabled>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-800">장소를 찾고 있어요...</h1>
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
                    <Button variant="outline" size="sm" className="p-2 bg-transparent" disabled>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="p-2 bg-transparent" disabled>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="p-2 bg-transparent" disabled>
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
                  <div className="w-16 h-8 bg-white/20 rounded animate-pulse"></div>
                  <div className="w-16 h-8 bg-white/20 rounded animate-pulse"></div>
                </div>
              </div>
              <PlaceCardsLoadingSkeleton />
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-white/20">
          <div className="container mx-auto max-w-7xl">
            <Button
              size="lg"
              disabled
              className="w-full bg-gray-300 text-gray-500 font-semibold py-4 text-lg cursor-not-allowed"
            >
              <LoadingSpinner message="" />
              장소를 찾는 중...
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
