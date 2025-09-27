"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Navigation, MapPin, Phone, ExternalLink, Clock } from "lucide-react"
import type { Restaurant } from "@/services/api"

interface Props {
  restaurants: Restaurant[]
  formatDistance: (distance: string) => string
  getMockRating: (r: Restaurant) => string
  travelTimes?: string[]
  onSelect?: (restaurant: Restaurant) => void
}

export function RestaurantList({ restaurants, formatDistance, getMockRating, travelTimes, onSelect }: Props) {
  return (
    <div className="space-y-4">
      {restaurants.map((restaurant) => (
        <Card
          key={ restaurant.place_id}
          className="bg-white/95 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
        >
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <img
                  src={ restaurant.image_url || "/placeholder.svg"}
                  alt={ restaurant.place_name}
                  className="w-24 h-20 object-cover rounded-lg"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg" }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">{restaurant.place_name}</h3>
                    <Badge variant="secondary" className="text-xs mt-1">
                      { restaurant.place_category || "음식점"}
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

                { restaurant.place_phone && (
                  <div className="flex items-center gap-1 text-gray-600 mb-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{restaurant.place_phone}</span>
                  </div>
                )}

                {travelTimes && (
                  <div className="flex items-center gap-1 text-gray-600 mb-3">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">예상 소요시간: {travelTimes.join(", ")}</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    onClick={() => onSelect?.(restaurant)}
                  >
                    선택하기
                  </Button>
                  { restaurant.place_url && (
                    <Button size="sm" variant="outline" className="border-gray-300" onClick={() => window.open(restaurant.place_url, "_blank")}>
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
  )
}
