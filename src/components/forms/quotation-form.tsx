"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
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
import { MultiStepForm, type Step } from "@/components/forms/multi-step-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"

const quotationItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  unit_price: z.number().positive("Unit price must be positive"),
  total: z.number().positive(),
})

const quotationFormSchema = z.object({
  lead_id: z.string().uuid("Please select a valid lead"),
  company_id: z.string().uuid().optional().or(z.null()),
  quote_number: z.string().optional(),
  total_amount: z.number().positive("Total amount must be positive"),
  currency: z.string().default("INR"),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'expired']).default('draft'),
  valid_until: z.string().optional(),
  items: z.array(quotationItemSchema).min(1, "At least one item is required"),
  terms: z.string().optional(),
  notes: z.string().optional(),
})

type QuotationFormValues = z.infer<typeof quotationFormSchema>

interface QuotationFormProps {
  quotation?: any
  onSubmit: (data: QuotationFormValues) => Promise<void>
  onCancel?: () => void
  leads: Array<{ id: string; full_name: string; lead_id: string }>
  companies?: Array<{ id: string; name: string }>
}

export function QuotationForm({
  quotation,
  onSubmit,
  onCancel,
  leads,
  companies = [],
}: QuotationFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0)

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationFormSchema),
    defaultValues: quotation
      ? {
          lead_id: quotation.lead_id,
          company_id: quotation.company_id || null,
          quote_number: quotation.quote_number || "",
          total_amount: quotation.total_amount || 0,
          currency: quotation.currency || "INR",
          status: quotation.status || "draft",
          valid_until: quotation.valid_until ? new Date(quotation.valid_until).toISOString().split('T')[0] : "",
          items: Array.isArray(quotation.items) 
            ? quotation.items 
            : typeof quotation.items === 'object' && quotation.items !== null
            ? Object.values(quotation.items as any)
            : [{ description: "", quantity: 1, unit_price: 0, total: 0 }],
          terms: quotation.terms || "",
          notes: quotation.notes || "",
        }
      : {
          lead_id: "",
          company_id: null,
          quote_number: "",
          total_amount: 0,
          currency: "INR",
          status: "draft",
          valid_until: "",
          items: [{ description: "", quantity: 1, unit_price: 0, total: 0 }],
          terms: "",
          notes: "",
        },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  // Calculate total when items change
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name?.startsWith("items")) {
        const items = form.getValues("items")
        const total = items.reduce((sum, item) => {
          const itemTotal = (item.quantity || 0) * (item.unit_price || 0)
          return sum + itemTotal
        }, 0)
        form.setValue("total_amount", total)
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  const handleSubmit = async (data: QuotationFormValues) => {
    try {
      await onSubmit(data)
      toast.success(quotation ? "Quotation updated successfully" : "Quotation created successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save quotation")
    }
  }

  // Step 1: Lead & Company
  const leadCompanyStep: Step = {
    id: "lead-company",
    title: "Lead & Company",
    description: "Select the lead and associated company",
    component: (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="lead_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lead *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a lead" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
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
          name="company_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No company</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    ),
  }

  // Step 2: Items
  const itemsStep: Step = {
    id: "items",
    title: "Quotation Items",
    description: "Add items and pricing to the quotation",
    component: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <FormLabel>Items</FormLabel>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ description: "", quantity: 1, unit_price: 0, total: 0 })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {fields.map((field, index) => (
          <Card key={field.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Item {index + 1}</CardTitle>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name={`items.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Input placeholder="Product description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            const qty = parseInt(e.target.value, 10) || 0
                            field.onChange(qty)
                            const unitPrice = form.getValues(`items.${index}.unit_price`) || 0
                            form.setValue(`items.${index}.total`, qty * unitPrice)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`items.${index}.unit_price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit Price *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value}
                          onChange={(e) => {
                            const price = parseFloat(e.target.value) || 0
                            field.onChange(price)
                            const qty = form.getValues(`items.${index}.quantity`) || 0
                            form.setValue(`items.${index}.total`, qty * price)
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`items.${index}.total`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          {...field}
                          value={field.value}
                          readOnly
                          className="bg-muted"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    ),
  }

  // Step 3: Details & Terms
  const detailsStep: Step = {
    id: "details",
    title: "Details & Terms",
    description: "Set quotation status, validity, and terms",
    component: (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="quote_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quote Number</FormLabel>
                <FormControl>
                  <Input placeholder="QT-2024-001" {...field} />
                </FormControl>
                <FormDescription>Auto-generated if left empty</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="CNY">CNY</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valid_until"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valid Until</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel className="text-base font-semibold">
            Total Amount: {form.getValues("currency")} {form.watch("total_amount").toFixed(2)}
          </FormLabel>
        </div>

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Terms & Conditions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Payment terms, delivery terms, etc."
                  className="min-h-[100px]"
                  {...field}
                />
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
              <FormLabel>Internal Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Internal notes (not visible to customer)"
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    ),
  }

  const steps: Step[] = [leadCompanyStep, itemsStep, detailsStep]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <MultiStepForm
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          canGoNext={true}
          isLastStep={currentStep === steps.length - 1}
          onSubmit={() => form.handleSubmit(handleSubmit)()}
        />

      </form>
    </Form>
  )
}

