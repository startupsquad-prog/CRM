"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const callFormSchema = z.object({
  lead_id: z.string().uuid().optional().or(z.null()),
  call_type: z.enum(['inbound', 'outbound']).default('outbound'),
  duration: z.number().int().positive().optional().or(z.null()),
  outcome: z.string().optional(),
  notes: z.string().optional(),
  scheduled_at: z.string().optional(),
  completed_at: z.string().optional(),
})

type CallFormValues = z.infer<typeof callFormSchema>

interface CallFormProps {
  call?: any
  onSubmit: (data: CallFormValues) => Promise<void>
  onCancel?: () => void
  leads?: Array<{ id: string; full_name: string; lead_id: string }>
}

export function CallForm({
  call,
  onSubmit,
  onCancel,
  leads = [],
}: CallFormProps) {
  const form = useForm<CallFormValues>({
    resolver: zodResolver(callFormSchema),
    defaultValues: call
      ? {
          lead_id: call.lead_id || null,
          call_type: call.call_type || "outbound",
          duration: call.duration || null,
          outcome: call.outcome || "",
          notes: call.notes || "",
          scheduled_at: call.scheduled_at ? new Date(call.scheduled_at).toISOString().slice(0, 16) : "",
          completed_at: call.completed_at ? new Date(call.completed_at).toISOString().slice(0, 16) : "",
        }
      : {
          lead_id: null,
          call_type: "outbound",
          duration: null,
          outcome: "",
          notes: "",
          scheduled_at: "",
          completed_at: "",
        },
  })

  const handleSubmit = async (data: CallFormValues) => {
    try {
      await onSubmit(data)
      toast.success(call ? "Call updated successfully" : "Call created successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save call")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="lead_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lead" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No lead</SelectItem>
                    {leads.map((lead) => (
                      <SelectItem key={lead.id} value={lead.id}>
                        {lead.full_name} ({lead.lead_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="call_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="scheduled_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled At</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="completed_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Completed At</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (seconds)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="300"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === "" ? null : parseInt(value, 10))
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Call duration in seconds
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="outcome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Outcome</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Interested, Not interested, Follow-up required" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Call notes and details..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : call ? "Update Call" : "Create Call"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

