"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, Grid3x3 } from "lucide-react"
import Link from "next/link"
import { Collection } from "@/types/product"

interface CollectionWithProducts extends Collection {
  products?: Array<{
    id: string
    name: string
    sku: string
    image_url?: string
  }>
  product_count?: number
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionWithProducts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollections()
  }, [])

  const fetchCollections = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/collections')
      if (!response.ok) throw new Error('Failed to fetch collections')
      
      const data = await response.json()
      setCollections(data.collections || [])
    } catch (error) {
      console.error('Error fetching collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateThumbnailCollage = (products: CollectionWithProducts['products']) => {
    if (!products || products.length === 0) {
      return (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <Package className="h-12 w-12 text-muted-foreground" />
        </div>
      )
    }

    // Create a 3x3 grid collage
    const gridItems = products.slice(0, 9)
    const gridCols = Math.ceil(Math.sqrt(gridItems.length))
    
    return (
      <div className={`grid grid-cols-3 gap-0.5 w-full h-full`}>
        {Array.from({ length: 9 }).map((_, index) => {
          const product = gridItems[index]
          if (!product) {
            return (
              <div key={index} className="aspect-square bg-muted/30" />
            )
          }
          
          return (
            <div
              key={product.id}
              className="aspect-square bg-muted overflow-hidden relative group"
            >
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden w-full max-w-full">
      <div className="flex flex-col gap-3 px-4 lg:px-6 flex-1 min-h-0 overflow-hidden py-3 w-full max-w-full min-w-0">
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-tight">Collections</h2>
          <p className="text-muted-foreground">
            Browse products organized by collections
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index}>
                <CardHeader>
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No collections found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-auto">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/employee/products?collection=${collection.id}`}
                className="block"
              >
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full flex flex-col group">
                  <CardHeader className="pb-3 flex-shrink-0">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-3 relative">
                      {generateThumbnailCollage(collection.products)}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    </div>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2 flex-1">
                        {collection.name}
                      </CardTitle>
                      <Badge variant="secondary" className="flex-shrink-0">
                        {collection.product_count || 0}
                      </Badge>
                    </div>
                    {collection.description && (
                      <CardDescription className="line-clamp-2 mt-1">
                        {collection.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end pt-0">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Grid3x3 className="h-3 w-3" />
                      <span>
                        {collection.product_count || 0} product
                        {(collection.product_count || 0) !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

