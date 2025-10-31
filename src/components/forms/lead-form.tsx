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
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { Lead, LeadSource, LeadStage } from "@/types/lead"

const leadFormSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  source: z.array(z.enum(['website', 'inbound-call', 'referral', 'email', 'social', 'trade-show', 'other'])).default([]),
  product_inquiry: z.array(z.string()).default([]),
  quantity: z.number().int().positive().optional().or(z.null()),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  product_id: z.string().uuid().optional().or(z.null()),
  assigned_to: z.string().uuid().optional().or(z.null()),
  client_id: z.string().uuid().optional().or(z.null()),
  stage: z.enum(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']).default('new'),
})

type LeadFormValues = z.infer<typeof leadFormSchema>

interface LeadFormProps {
  lead?: Lead
  onSubmit: (data: LeadFormValues) => Promise<void>
  onCancel?: () => void
  products?: Array<{ id: string; name: string }>
  users?: Array<{ id: string; full_name: string }>
  clients?: Array<{ id: string; name: string }>
}

export function LeadForm({
  lead,
  onSubmit,
  onCancel,
  products = [],
  users = [],
  clients = [],
}: LeadFormProps) {
  const [tagInput, setTagInput] = React.useState("")
  const [productInquiryInput, setProductInquiryInput] = React.useState("")

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: lead
      ? {
          full_name: lead.full_name,
          email: lead.email || "",
          phone: lead.phone || "",
          whatsapp: lead.whatsapp || "",
          source: lead.source || [],
          product_inquiry: lead.product_inquiry || [],
          quantity: lead.quantity || null,
          tags: lead.tags || [],
          notes: lead.notes || "",
          product_id: lead.product_id || null,
          assigned_to: lead.assigned_to || null,
          client_id: lead.client_id || null,
          stage: lead.stage || "new",
        }
      : {
          full_name: "",
          email: "",
          phone: "",
          whatsapp: "",
          source: [],
          product_inquiry: [],
          quantity: null,
          tags: [],
          notes: "",
          product_id: null,
          assigned_to: null,
          client_id: null,
          stage: "new",
        },
  })

  const handleSubmit = async (data: LeadFormValues) => {
    try {
      await onSubmit(data)
      toast.success(lead ? "Lead updated successfully" : "Lead created successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save lead")
    }
  }

  const addTag = () => {
    if (tagInput.trim()) {
      const currentTags = form.getValues("tags") || []
      if (!currentTags.includes(tagInput.trim())) {
        form.setValue("tags", [...currentTags, tagInput.trim()])
        setTagInput("")
      }
    }
  }

  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags") || []
    form.setValue("tags", currentTags.filter((t) => t !== tag))
  }

  const addProductInquiry = () => {
    if (productInquiryInput.trim()) {
      const current = form.getValues("product_inquiry") || []
      if (!current.includes(productInquiryInput.trim())) {
        form.setValue("product_inquiry", [...current, productInquiryInput.trim()])
        setProductInquiryInput("")
      }
    }
  }

  const removeProductInquiry = (inquiry: string) => {
    const current = form.getValues("product_inquiry") || []
    form.setValue("product_inquiry", current.filter((i) => i !== inquiry))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Basic Information</h3>
          
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+1234567890" {...field} />
                </FormControl>
                <FormDescription>
                  WhatsApp number for direct messaging
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Source and Stage */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Lead Details</h3>

          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Source</FormLabel>
                <Select
                  onValueChange={(value) => {
                    const current = field.value || []
                    if (!current.includes(value as LeadSource)) {
                      field.onChange([...current, value as LeadSource])
                    }
                  }}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Add lead source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="inbound-call">Inbound Call</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="trade-show">Trade Show</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {field.value && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {field.value.map((source) => (
                      <Badge key={source} variant="secondary" className="gap-1">
                        {source}
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange(field.value?.filter((s) => s !== source) || [])
                          }}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stage</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                    <SelectItem value="won">Won</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Product Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Product Information</h3>

          <FormField
            control={form.control}
            name="product_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No product selected</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <FormLabel>Product Inquiries</FormLabel>
            <div className="flex gap-2">
              <Input
                value={productInquiryInput}
                onChange={(e) => setProductInquiryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addProductInquiry()
                  }
                }}
                placeholder="Enter product inquiry"
              />
              <Button type="button" onClick={addProductInquiry} variant="outline">
                Add
              </Button>
            </div>
            {form.watch("product_inquiry")?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch("product_inquiry")?.map((inquiry) => (
                  <Badge key={inquiry} variant="secondary" className="gap-1">
                    {inquiry}
                    <button
                      type="button"
                      onClick={() => removeProductInquiry(inquiry)}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="100"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === "" ? null : parseInt(value, 10))
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Assignment */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Assignment</h3>

          <FormField
            control={form.control}
            name="assigned_to"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assign To</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select user" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name}
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
            name="client_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                  value={field.value || "none"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">No client</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Additional Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Additional Information</h3>

          <div className="space-y-2">
            <FormLabel>Tags</FormLabel>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
                placeholder="Enter tag and press Enter"
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            {form.watch("tags")?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.watch("tags")?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any additional notes about this lead..."
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : lead ? "Update Lead" : "Create Lead"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

