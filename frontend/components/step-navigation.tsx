"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface StepNavigationProps {
  currentStep: number
  className?: string
}

const steps = [
  { id: 1, label: "참석자 입력", description: "출발지 입력" },
  { id: 2, label: "장소 선택", description: "최적 장소 찾기" },
  { id: 3, label: "정산 계산", description: "비용 계산" },
  { id: 4, label: "공유 완료", description: "결과 공유" },
]

export function StepNavigation({ currentStep, className }: StepNavigationProps) {
  return (
    <div className={cn("w-full px-4 py-6 bg-white/80 backdrop-blur-sm border-b", className)}>
      <div className="max-w-md mx-auto">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>진행률</span>
            <span>{Math.round((currentStep / 4) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-6 left-6 right-6 h-0.5 bg-gray-200">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step) => {
              const isCompleted = step.id < currentStep
              const isCurrent = step.id === currentStep
              const isUpcoming = step.id > currentStep

              return (
                <div key={step.id} className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 relative z-10",
                      {
                        "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg": isCurrent,
                        "bg-green-500 text-white": isCompleted,
                        "bg-gray-200 text-gray-400": isUpcoming,
                      },
                    )}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <span>{step.id}</span>}
                  </div>

                  {/* Step Label */}
                  <div className="mt-3 text-center">
                    <div
                      className={cn("text-sm font-medium transition-colors duration-300", {
                        "text-blue-600": isCurrent,
                        "text-green-600": isCompleted,
                        "text-gray-400": isUpcoming,
                      })}
                    >
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
