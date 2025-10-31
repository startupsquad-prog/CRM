"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number | null
  onRatingChange?: (rating: number) => Promise<void> | void
  readonly?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
}

export function StarRating({
  rating,
  onRatingChange,
  readonly = false,
  size = "md",
  className,
}: StarRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const displayRating = hoveredRating ?? rating ?? 0

  const handleClick = async (newRating: number) => {
    if (readonly || !onRatingChange || isUpdating) return

    // Don't update if clicking the same rating
    if (rating === newRating) return

    setIsUpdating(true)
    try {
      await onRatingChange(newRating)
    } catch (error) {
      console.error("Failed to update rating:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div
      className={cn("flex items-center gap-0.5", className)}
      onMouseLeave={() => !readonly && setHoveredRating(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= displayRating
        return (
          <button
            key={star}
            type="button"
            disabled={readonly || isUpdating}
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readonly && setHoveredRating(star)}
            className={cn(
              "transition-all duration-150",
              !readonly && "cursor-pointer hover:scale-110",
              readonly && "cursor-default",
              isUpdating && "opacity-50 cursor-wait"
            )}
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200 dark:fill-gray-700 dark:text-gray-700"
              )}
            />
          </button>
        )
      })}
    </div>
  )
}

