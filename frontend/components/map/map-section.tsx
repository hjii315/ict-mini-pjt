"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ZoomIn, ZoomOut, Navigation } from "lucide-react"
import { ReactNode } from "react"

interface Props {
  title?: string
  children: ReactNode
}

export function MapSection({ title = "지도", children }: Props) {
  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl h-[500px] lg:h-[700px]">
      <CardContent className="p-6 h-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
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
        <div className="h-full bg-gray-100 rounded-lg">{children}</div>
      </CardContent>
    </Card>
  )
}
