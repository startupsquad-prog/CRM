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
import { Switch } from "@/components/ui/switch"

const messageTemplateFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  subject: z.string().optional(),
  body: z.string().min(10, "Body must be at least 10 characters"),
  type: z.enum(['email', 'sms', 'whatsapp', 'letter']).default('email'),
  category: z.string().optional(),
  is_public: z.boolean().default(false),
})

type MessageTemplateFormValues = z.infer<typeof messageTemplateFormSchema>

interface MessageTemplateFormProps {
  template?: any
  onSubmit: (data: MessageTemplateFormValues) => Promise<void>
  onCancel?: () => void
}

export function MessageTemplateForm({
  template,
  onSubmit,
  onCancel,
}: MessageTemplateFormProps) {
  const form = useForm<MessageTemplateFormValues>({
    resolver: zodResolver(messageTemplateFormSchema),
    defaultValues: template
      ? {
          name: template.name || "",
          subject: template.subject || "",
          body: template.body || "",
          type: template.type || "email",
          category: template.category || "",
          is_public: template.is_public || false,
        }
      : {
          name: "",
          subject: "",
          body: "",
          type: "email",
          category: "",
          is_public: false,
        },
  })

  const handleSubmit = async (data: MessageTemplateFormValues) => {
    try {
      await onSubmit(data)
      toast.success(template ? "Template updated successfully" : "Template created successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save template")
    }
  }

  const messageType = form.watch("type")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Welcome Email Template" {...field} />
                </FormControl>
                <FormDescription>
                  A descriptive name for this template
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message Type *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="letter">Letter</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Welcome, Follow-up, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {messageType === "email" && (
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Welcome to our service!" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message Body *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      messageType === "email"
                        ? "Dear {{name}},\n\nThank you for your interest..."
                        : messageType === "sms" || messageType === "whatsapp"
                          ? "Hi {{name}}, thank you for contacting us..."
                          : "Dear {{name}},..."
                    }
                    className="min-h-[200px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Use {`{{name}}`}, {`{{company}}`} for dynamic placeholders
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_public"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Public Template</FormLabel>
                  <FormDescription>
                    Make this template available to all users
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
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
            {form.formState.isSubmitting ? "Saving..." : template ? "Update Template" : "Create Template"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

