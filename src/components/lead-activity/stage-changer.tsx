"use client"

import { useState } from "react"
import { Lead, LeadStage } from "@/types/lead"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import confetti from "canvas-confetti"

interface StageChangerProps {
  lead: Lead
  onStageChange: (newStage: LeadStage) => void
}

const stages: { value: LeadStage; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-purple-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-indigo-500' },
  { value: 'proposal', label: 'Proposal', color: 'bg-orange-500' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-yellow-500' },
  { value: 'won', label: 'Won', color: 'bg-green-500' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500' },
]

export function StageChanger({ lead, onStageChange }: StageChangerProps) {
  const [loading, setLoading] = useState(false)

  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      })
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      })
    }, 250)
  }

  const handleStageChange = async (newStage: LeadStage) => {
    if (newStage === lead.stage) return

    try {
      setLoading(true)

      const response = await fetch(`/api/leads/${lead.id}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })

      if (!response.ok) {
        throw new Error('Failed to update stage')
      }

      // Create activity log for stage change
      await fetch(`/api/leads/${lead.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: 'stage_change',
          description: `Stage changed from ${lead.stage} to ${newStage}`,
          metadata: {
            old_stage: lead.stage,
            new_stage: newStage,
          },
        }),
      })

      // Trigger confetti if won
      if (newStage === 'won') {
        triggerConfetti()
        toast.success('🎉 Lead won! Great job!')
      } else {
        toast.success(`Stage updated to ${newStage}`)
      }

      onStageChange(newStage)
    } catch (error) {
      console.error('Error updating stage:', error)
      toast.error('Failed to update stage')
    } finally {
      setLoading(false)
    }
  }

  const currentStage = stages.find(s => s.value === lead.stage)

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Stage:</span>
      <Select
        value={lead.stage}
        onValueChange={(value) => handleStageChange(value as LeadStage)}
        disabled={loading}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            {currentStage ? (
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${currentStage.color}`} />
                <span>{currentStage.label}</span>
              </div>
            ) : (
              lead.stage
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {stages.map((stage) => (
            <SelectItem key={stage.value} value={stage.value}>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                <span>{stage.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

