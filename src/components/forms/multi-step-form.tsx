"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

export interface Step {
  id: string
  title: string
  description?: string
  component: React.ReactNode
}

interface MultiStepFormProps {
  steps: Step[]
  currentStep: number
  onStepChange: (step: number) => void
  onNext?: () => void
  onPrevious?: () => void
  onSubmit?: () => void
  showProgress?: boolean
  className?: string
  canGoNext?: boolean
  canGoPrevious?: boolean
  isLastStep?: boolean
}

export function MultiStepForm({
  steps,
  currentStep,
  onStepChange,
  onNext,
  onPrevious,
  onSubmit,
  showProgress = true,
  className,
  canGoNext = true,
  canGoPrevious = true,
  isLastStep = false,
}: MultiStepFormProps) {
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (onNext) {
        onNext()
      } else {
        onStepChange(currentStep + 1)
      }
    } else {
      // Last step - trigger submit
      if (onSubmit) {
        onSubmit()
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      if (onPrevious) {
        onPrevious()
      } else {
        onStepChange(currentStep - 1)
      }
    }
  }

  const currentStepData = steps[currentStep]

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="font-medium">{currentStepData.title}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Step Content */}
      <div className="min-h-[400px]">{currentStepData.component}</div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0 || !canGoPrevious}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>

        <div className="flex gap-2">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(index)}
              className={cn(
                "h-2 w-2 rounded-full transition-colors",
                index === currentStep
                  ? "bg-primary"
                  : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
              )}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        <Button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
        >
          {isLastStep ? "Submit" : "Next"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

