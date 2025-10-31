"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Lead } from "@/types/lead"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const callFormSchema = z.object({
  call_type: z.enum(['inbound', 'outbound', 'missed']),
  direction: z.enum(['incoming', 'outgoing']),
  duration_seconds: z.number().min(0).optional(),
  phone_number: z.string().optional(),
  outcome: z.enum(['answered', 'voicemail', 'no_answer', 'busy', 'failed']).optional(),
  notes: z.string().optional(),
  call_date: z.string().optional(),
})

type CallFormData = z.infer<typeof callFormSchema>

interface CallFormProps {
  lead: Lead
  onSuccess: () => void
}

export function CallForm({ lead, onSuccess }: CallFormProps) {
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CallFormData>({
    resolver: zodResolver(callFormSchema),
    defaultValues: {
      call_type: 'outbound',
      direction: 'outgoing',
      duration_seconds: 0,
      phone_number: lead.phone || '',
      call_date: new Date().toISOString().slice(0, 16),
    },
  })

  const onSubmit = async (data: CallFormData) => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/leads/${lead.id}/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to log call')
      }

      toast.success('Call logged successfully')
      reset()
      onSuccess()
    } catch (error) {
      console.error('Error logging call:', error)
      toast.error('Failed to log call')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="call_type">Call Type</Label>
          <Select
            value={watch('call_type')}
            onValueChange={(value) => setValue('call_type', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inbound">Inbound</SelectItem>
              <SelectItem value="outbound">Outbound</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
            </SelectContent>
          </Select>
          {errors.call_type && (
            <p className="text-sm text-destructive">{errors.call_type.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="direction">Direction</Label>
          <Select
            value={watch('direction')}
            onValueChange={(value) => setValue('direction', value as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="incoming">Incoming</SelectItem>
              <SelectItem value="outgoing">Outgoing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            {...register('phone_number')}
            placeholder={lead.phone || "Enter phone number"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration_seconds">Duration (seconds)</Label>
          <Input
            id="duration_seconds"
            type="number"
            {...register('duration_seconds', { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="outcome">Outcome</Label>
          <Select
            value={watch('outcome') || ''}
            onValueChange={(value) => setValue('outcome', value as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="answered">Answered</SelectItem>
              <SelectItem value="voicemail">Voicemail</SelectItem>
              <SelectItem value="no_answer">No Answer</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="call_date">Call Date & Time</Label>
          <Input
            id="call_date"
            type="datetime-local"
            {...register('call_date')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          {...register('notes')}
          placeholder="Add call notes..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Logging...' : 'Log Call'}
      </Button>
    </form>
  )
}

