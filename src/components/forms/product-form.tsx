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
import { MultiStepForm, type Step } from "@/components/forms/multi-step-form"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { Product } from "@/types/product"

const productFormSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().optional(),
  sub_category: z.string().optional(),
  current_market_price: z.number().positive().optional().or(z.null()),
  cost_price_per_unit: z.number().positive().optional().or(z.null()),
  cost_price_20gp: z.number().positive().optional().or(z.null()),
  cost_price_40hq: z.number().positive().optional().or(z.null()),
  minimum_order_quantity: z.number().int().positive().default(1),
  packing_details: z.record(z.any()).optional(),
  features: z.record(z.any()).optional(),
  product_summary: z.string().optional(),
  market_price_research: z.string().optional(),
  alibaba_url: z.string().url().optional().or(z.literal("")),
  listing_url: z.string().url().optional().or(z.literal("")),
  collection_id: z.string().uuid().optional().or(z.null()),
})

type ProductFormValues = z.infer<typeof productFormSchema>

interface ProductFormProps {
  product?: Product
  onSubmit: (data: ProductFormValues) => Promise<void>
  onCancel?: () => void
  collections?: Array<{ id: string; name: string }>
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  collections = [],
}: ProductFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product
      ? {
          sku: product.sku,
          name: product.name,
          category: product.category || "",
          sub_category: product.sub_category || "",
          current_market_price: product.current_market_price || null,
          cost_price_per_unit: product.cost_price_per_unit || null,
          cost_price_20gp: product.cost_price_20gp || null,
          cost_price_40hq: product.cost_price_40hq || null,
          minimum_order_quantity: product.minimum_order_quantity || 1,
          packing_details: product.packing_details || {},
          features: product.features || {},
          product_summary: product.product_summary || "",
          market_price_research: product.market_price_research || "",
          alibaba_url: product.alibaba_url || "",
          listing_url: product.listing_url || "",
          collection_id: product.collection_id || null,
        }
      : {
          sku: "",
          name: "",
          category: "",
          sub_category: "",
          current_market_price: null,
          cost_price_per_unit: null,
          cost_price_20gp: null,
          cost_price_40hq: null,
          minimum_order_quantity: 1,
          packing_details: {},
          features: {},
          product_summary: "",
          market_price_research: "",
          alibaba_url: "",
          listing_url: "",
          collection_id: null,
        },
  })

  const handleSubmit = async (data: ProductFormValues) => {
    try {
      await onSubmit(data)
      toast.success(product ? "Product updated successfully" : "Product created successfully")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product")
    }
  }

  // Validate current step before allowing next
  const validateCurrentStep = async () => {
    const stepFields: Record<number, (keyof ProductFormValues)[]> = {
      0: ['sku', 'name', 'minimum_order_quantity'],
      1: [],
      2: [],
    }
    const fieldsToValidate = stepFields[currentStep] || []
    
    if (fieldsToValidate.length > 0) {
      const result = await form.trigger(fieldsToValidate as any)
      return result
    }
    return true
  }

  const canGoNext = true

  // Step 1: Basic Information
  const basicInfoStep: Step = {
    id: "basic",
    title: "Basic Information",
    description: "Product name, SKU, and categorization",
    component: (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="sku"
          render={({ field }) => (
            <FormItem>
              <FormLabel>SKU *</FormLabel>
              <FormControl>
                <Input placeholder="PROD-001" {...field} />
              </FormControl>
              <FormDescription>Unique product identifier</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Name *</FormLabel>
              <FormControl>
                <Input placeholder="Product Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Electronics" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sub_category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub Category</FormLabel>
                <FormControl>
                  <Input placeholder="Smartphones" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="collection_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collection</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                value={field.value || "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select collection" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">No collection</SelectItem>
                  {collections.map((collection) => (
                    <SelectItem key={collection.id} value={collection.id}>
                      {collection.name}
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
          name="minimum_order_quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Order Quantity *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value === "" ? 1 : parseInt(value, 10) || 1)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    ),
  }

  // Step 2: Pricing
  const pricingStep: Step = {
    id: "pricing",
    title: "Pricing Information",
    description: "Set product pricing and cost structure",
    component: (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="current_market_price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Market Price</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="99.99"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value === "" ? null : parseFloat(value))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cost_price_per_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost Price Per Unit</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="50.00"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => {
                    const value = e.target.value
                    field.onChange(value === "" ? null : parseFloat(value))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cost_price_20gp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price (20GP Container)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="50000.00"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === "" ? null : parseFloat(value))
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cost_price_40hq"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price (40HQ Container)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="100000.00"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) => {
                      const value = e.target.value
                      field.onChange(value === "" ? null : parseFloat(value))
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    ),
  }

  // Step 3: Details
  const detailsStep: Step = {
    id: "details",
    title: "Product Details",
    description: "Product summary, features, and additional information",
    component: (
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="product_summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Summary</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the product..."
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
          name="market_price_research"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Market Price Research</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Research notes on market pricing..."
                  className="min-h-[80px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="alibaba_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alibaba URL</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="listing_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Listing URL</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    ),
  }

  const steps: Step[] = [basicInfoStep, pricingStep, detailsStep]

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <MultiStepForm
          steps={steps}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          onNext={async () => {
            const isValid = await validateCurrentStep()
            if (isValid) {
              setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
            }
          }}
          canGoNext={canGoNext}
          isLastStep={currentStep === steps.length - 1}
          onSubmit={() => form.handleSubmit(handleSubmit)()}
        />

      </form>
    </Form>
  )
}

