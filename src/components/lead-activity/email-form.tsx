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
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"

const emailFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
  to_email: z.string().email('Valid email is required'),
  from_email: z.string().email('Valid email is required'),
})

type EmailFormData = z.infer<typeof emailFormSchema>

interface EmailFormProps {
  lead: Lead
  onSuccess: () => void
}

export function EmailForm({ lead, onSuccess }: EmailFormProps) {
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      subject: '',
      body: '',
      to_email: lead.email || '',
      from_email: user?.primaryEmailAddress?.emailAddress || '',
    },
  })

  const onSubmit = async (data: EmailFormData) => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/leads/${lead.id}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          direction: 'sent',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send email')
      }

      const result = await response.json()
      toast.success(result.message || 'Email sent successfully (dummy mode)')
      reset()
      onSuccess()
    } catch (error) {
      console.error('Error sending email:', error)
      toast.error('Failed to send email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="to_email">To</Label>
        <Input
          id="to_email"
          type="email"
          {...register('to_email')}
          placeholder="recipient@example.com"
        />
        {errors.to_email && (
          <p className="text-sm text-destructive">{errors.to_email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="from_email">From</Label>
        <Input
          id="from_email"
          type="email"
          {...register('from_email')}
          placeholder="sender@example.com"
        />
        {errors.from_email && (
          <p className="text-sm text-destructive">{errors.from_email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          {...register('subject')}
          placeholder="Email subject"
        />
        {errors.subject && (
          <p className="text-sm text-destructive">{errors.subject.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">Message</Label>
        <Textarea
          id="body"
          {...register('body')}
          placeholder="Your email message..."
          rows={8}
        />
        {errors.body && (
          <p className="text-sm text-destructive">{errors.body.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Note: This is a dummy email sender. Emails are logged but not actually sent.
        </p>
        <Button type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Email'}
        </Button>
      </div>
    </form>
  )
}

