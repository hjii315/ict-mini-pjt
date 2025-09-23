"use client"

import { Loader2, MapPin, Wifi, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// Map Loading Skeleton
export function MapLoadingSkeleton() {
  return (
    <div className="w-full h-64 md:h-full bg-gray-100 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-bounce" />
          <p className="text-sm text-gray-500">지도를 불러오는 중...</p>
        </div>
      </div>
    </div>
  )
}

// Place Cards Loading Skeleton
export function PlaceCardsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="flex space-x-4">
            <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// API Error State
export function ApiErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <RefreshCw className="w-8 h-8 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">데이터를 불러올 수 없습니다</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        서버에서 정보를 가져오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.
      </p>
      <Button onClick={onRetry} className="bg-gradient-to-r from-blue-500 to-purple-600">
        <RefreshCw className="w-4 h-4 mr-2" />
        다시 시도
      </Button>
    </div>
  )
}

// Empty State - No Places Found
export function EmptyPlacesState() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <MapPin className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">추천할 장소가 없습니다</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        입력하신 조건에 맞는 장소를 찾을 수 없습니다. 다른 지역이나 조건으로 다시 검색해보세요.
      </p>
      <Button variant="outline" onClick={() => window.history.back()}>
        다시 검색하기
      </Button>
    </div>
  )
}

// Network Connection Error
export function NetworkErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Wifi className="w-8 h-8 text-orange-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">인터넷 연결을 확인해주세요</h3>
      <p className="text-gray-600 mb-6 max-w-sm mx-auto">
        네트워크 연결이 불안정합니다. 인터넷 연결을 확인하고 다시 시도해주세요.
      </p>
      <div className="space-y-3">
        <Button onClick={onRetry} className="bg-gradient-to-r from-blue-500 to-purple-600">
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 연결
        </Button>
        <p className="text-xs text-gray-500">오프라인 상태에서는 일부 기능이 제한될 수 있습니다</p>
      </div>
    </div>
  )
}

// General Loading Spinner
export function LoadingSpinner({ message = "로딩 중..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  )
}
