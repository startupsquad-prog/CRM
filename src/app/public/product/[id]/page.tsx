"use client"

import * as React from "react"
import { use, Suspense } from "react"
import { PublicLeadForm } from "@/components/forms/public-lead-form"
import { createBrowserSupabaseClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function ProductLeadFormContent({ id }: { id: string }) {
  const [product, setProduct] = React.useState<{ id: string; name: string; sku?: string; product_summary?: string } | null>(null)
  const [products, setProducts] = React.useState<Array<{ id: string; name: string; sku?: string }>>([])
  const [loading, setLoading] = React.useState(true)
  const supabase = createBrowserSupabaseClient()

  React.useEffect(() => {
    async function fetchData() {
      try {
        // Fetch the specific product
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("id, name, sku, product_summary")
          .eq("id", id)
          .single()

        if (productError) throw productError
        setProduct(productData)

        // Fetch all products for the dropdown
        const { data: allProducts, error: productsError } = await supabase
          .from("products")
          .select("id, name, sku")
          .order("name", { ascending: true })
          .limit(100)

        if (productsError) throw productsError
        setProducts(allProducts || [])
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load product information")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, supabase])

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
      const { error } = await supabase.from("leads").insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        source: [data.source],
        product_inquiry: data.product_inquiry ? [data.product_inquiry] : [],
        quantity: data.quantity,
        product_id: data.product_id || id,
        notes: data.message,
        stage: "new",
      })

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(error.message || "Failed to submit lead")
      }
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
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground">The product you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Request a Quote</h1>
          <p className="text-muted-foreground">
            Interested in {product.name}? Fill out the form below and we'll get back to you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              {product.sku && (
                <CardDescription>SKU: {product.sku}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {product.product_summary ? (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {product.product_summary}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No product description available.
                </p>
              )}
            </CardContent>
          </Card>

          <PublicLeadForm
            productId={id}
            products={products}
            onSubmit={handleSubmit}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

export default function ProductLeadFormPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    }>
      <ProductLeadFormContent id={use(params).id} />
    </Suspense>
  )
}

