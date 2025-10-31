"use client"

import * as React from "react"
import { PublicLeadForm } from "@/components/forms/public-lead-form"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function PublicLeadFormPage() {
  const [products, setProducts] = React.useState<Array<{ id: string; name: string; sku?: string }>>([])
  const [loading, setLoading] = React.useState(true)
  const supabase = createBrowserSupabaseClient()

  React.useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, sku")
          .order("name", { ascending: true })
          .limit(100)

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        console.error("Error fetching products:", error)
        toast.error("Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [supabase])

  const handleSubmit = async (data: {
    full_name: string
    email: string
    phone: string
    company_name?: string
    product_id: string
    product_inquiry?: string
    quantity?: number | null
    message?: string
    source: string
  }) => {
    try {
      // Create lead in database
      const { error } = await supabase.from("leads").insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        source: [data.source],
        product_inquiry: data.product_inquiry ? [data.product_inquiry] : [],
        quantity: data.quantity,
        product_id: data.product_id,
        notes: data.message,
        stage: "new",
      })

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(error.message || "Failed to submit lead")
      }

      // Optionally send notification email or webhook
      // You can add that logic here
    } catch (error) {
      console.error("Error submitting lead:", error)
      const message = error instanceof Error ? error.message : "Failed to submit lead"
      toast.error(message)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8 space-y-2">
            <Skeleton className="h-9 w-48 mx-auto" />
            <Skeleton className="h-4 w-96 mx-auto" />
          </div>
          <div className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Get a Quote</h1>
          <p className="text-muted-foreground">
            Fill out the form below and our team will contact you within 24 hours.
          </p>
        </div>

        <PublicLeadForm
          products={products}
          onSubmit={handleSubmit}
          className="w-full"
        />
      </div>
    </div>
  )
}

