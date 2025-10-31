"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Lead } from "@/types/lead"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"

const noteFormSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
  is_private: z.boolean().default(false),
})

type NoteFormData = z.infer<typeof noteFormSchema>

interface NoteFormProps {
  lead: Lead
  onSuccess: () => void
}

export function NoteForm({ lead, onSuccess }: NoteFormProps) {
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<NoteFormData>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      content: '',
      is_private: false,
    },
  })

  const isPrivate = watch('is_private')

  const onSubmit = async (data: NoteFormData) => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/leads/${lead.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create note')
      }

      toast.success('Note added successfully')
      reset()
      onSuccess()
    } catch (error) {
      console.error('Error creating note:', error)
      toast.error('Failed to add note')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Note Content</Label>
        <Textarea
          id="content"
          {...register('content')}
          placeholder="Enter your note here..."
          rows={8}
        />
        {errors.content && (
          <p className="text-sm text-destructive">{errors.content.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_private"
          checked={isPrivate}
          onCheckedChange={(checked) => setValue('is_private', checked as boolean)}
        />
        <Label
          htmlFor="is_private"
          className="text-sm font-normal cursor-pointer"
        >
          Private note (only visible to me)
        </Label>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Adding...' : 'Add Note'}
      </Button>
    </form>
  )
}

