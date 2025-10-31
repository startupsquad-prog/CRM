"use client"

import { ProductVariant } from "@/types/product"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface ProductVariantSelectorProps {
  variants: ProductVariant[]
  selectedVariantId?: string
  onVariantChange: (variant: ProductVariant) => void
  size?: "sm" | "md" | "lg"
}

export function ProductVariantSelector({
  variants,
  selectedVariantId,
  onVariantChange,
  size = "md",
}: ProductVariantSelectorProps) {
  if (!variants || variants.length === 0) {
    return null
  }

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {variants.map((variant) => {
        const isSelected = selectedVariantId === variant.id || (selectedVariantId === undefined && variant.is_default)
        
        return (
          <button
            key={variant.id}
            onClick={() => onVariantChange(variant)}
            className={cn(
              "rounded-full border-2 transition-all flex items-center justify-center relative",
              sizeClasses[size],
              isSelected
                ? "border-primary bg-primary text-primary-foreground shadow-md scale-110"
                : "border-border bg-background hover:border-primary/50 hover:bg-accent",
              !variant.is_active && "opacity-50 cursor-not-allowed"
            )}
            disabled={!variant.is_active}
            title={variant.name}
          >
            {isSelected && (
              <Check className="h-3 w-3 absolute" />
            )}
            {variant.image_url && !isSelected ? (
              <img
                src={variant.image_url}
                alt={variant.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="sr-only">{variant.name}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

