"use client"

import { useState, useEffect, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Package, ShoppingBag, Grid3x3, List } from "lucide-react"
import { Product, Collection, ProductVariant } from "@/types/product"
import { toast } from "sonner"
import { LeadsViewToggle } from "@/components/leads-table/leads-view-toggle"
import { DataTableExportMenu } from "@/components/leads-table/leads-export-menu"
import { ProductVariantSelector } from "@/components/products/product-variant-selector"
import { ProductDetailsModal } from "@/components/products/product-details-modal"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [primaryFilter, setPrimaryFilter] = useState<string>("all")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productVariantMap, setProductVariantMap] = useState<Record<string, ProductVariant>>({})

  useEffect(() => {
    fetchCollections()
    // Check for collection param in URL
    const collectionParam = searchParams?.get('collection')
    if (collectionParam) {
      setSelectedCollection(collectionParam)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [selectedCollection, selectedCategory, searchQuery])

  const fetchCollections = async () => {
    try {
      const response = await fetch('/api/collections')
      if (response.ok) {
        const data = await response.json()
        setCollections(data.collections || [])
      }
    } catch (error) {
      console.error('Error fetching collections:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (selectedCollection) {
        params.append('collection_id', selectedCollection)
      }
      if (selectedCategory) {
        params.append('category', selectedCategory)
      }
      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }
      
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map(p => p.category).filter(Boolean)))
    return cats
  }, [products])

  const filteredProducts = useMemo(() => {
    let result = products

    if (primaryFilter !== "all") {
      if (primaryFilter === "with_variants") {
        result = result.filter(p => p.variants_rel && p.variants_rel.length > 0)
      } else if (primaryFilter === "in_collection") {
        result = result.filter(p => p.collection_id)
      }
    }

    return result
  }, [products, primaryFilter])

  const getProductImage = (product: Product): string | null => {
    const primaryImage = product.images?.find(img => img.is_primary)
    if (primaryImage) return primaryImage.image_url
    if (product.images && product.images.length > 0) {
      return product.images[0].image_url
    }
    const variantImage = product.variants_rel?.find(v => v.image_url)?.image_url
    if (variantImage) return variantImage
    return null
  }

  const getDefaultVariant = (product: Product) => {
    return product.variants_rel?.find(v => v.is_default) || product.variants_rel?.[0]
  }

  const formatPrice = (price?: number) => {
    if (!price) return '—'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getFilterCount = (filter: string) => {
    if (filter === "all") return products.length
    if (filter === "with_variants") return products.filter(p => p.variants_rel && p.variants_rel.length > 0).length
    if (filter === "in_collection") return products.filter(p => p.collection_id).length
    return 0
  }

  const handleVariantChange = (productId: string, variant: ProductVariant) => {
    setProductVariantMap(prev => ({ ...prev, [productId]: variant }))
  }

  const getSelectedVariant = (product: Product): ProductVariant | null => {
    return productVariantMap[product.id] || getDefaultVariant(product)
  }

  const formatDDP = (ddp?: number) => {
    if (!ddp) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(ddp)
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden w-full max-w-full">
      <div className="flex flex-col gap-3 px-4 lg:px-6 flex-1 min-h-0 overflow-hidden py-3 w-full max-w-full min-w-0">
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Browse and explore our product catalog
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : products.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : new Set(products.map(p => p.collection_id).filter(Boolean)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : products.reduce((sum, p) => sum + (p.lead_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : products.reduce((sum, p) => sum + (p.order_count || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Toolbar */}
        <div className="flex-1 min-h-0 flex flex-col w-full max-w-full min-w-0">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-shrink-0 space-y-3">
              {/* Filter Tabs */}
              <div className="flex flex-col gap-3 sticky top-0 z-10 bg-background pb-2 border-b">
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  <Tabs value={primaryFilter} onValueChange={setPrimaryFilter} className="w-full">
                    <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent min-w-0">
                      <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        All Products
                        {getFilterCount("all") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("all")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="with_variants" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        With Variants
                        {getFilterCount("with_variants") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("with_variants")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="in_collection" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        In Collections
                        {getFilterCount("in_collection") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("in_collection")}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full">
                  <div className="flex flex-1 items-center gap-2 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <div className="relative flex-1 min-w-[150px]">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products by name, SKU, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 h-8 w-full sm:w-[250px]"
                      />
                    </div>
                    <Select
                      value={selectedCollection || "all"}
                      onValueChange={(value) => setSelectedCollection(value === "all" ? null : value)}
                    >
                      <SelectTrigger className="h-8 w-full sm:w-[200px]">
                        <SelectValue placeholder="All Collections" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Collections</SelectItem>
                        {collections.map((collection) => (
                          <SelectItem key={collection.id} value={collection.id}>
                            {collection.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {categories.length > 0 && (
                      <Select
                        value={selectedCategory || "all"}
                        onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
                      >
                        <SelectTrigger className="h-8 w-full sm:w-[200px]">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 border-l pl-2 ml-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3x3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <DataTableExportMenu data={filteredProducts as any} filename="products" />
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            <div className="flex-1 min-h-0 overflow-auto">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <Skeleton className="h-48 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No products found</p>
                  </CardContent>
                </Card>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => {
                    const selectedVariant = getSelectedVariant(product)
                    const imageUrl = selectedVariant?.image_url || getProductImage(product)
                    const price = selectedVariant?.price || product.current_market_price

                    return (
                      <Card 
                        key={product.id} 
                        className="hover:shadow-lg transition-shadow flex flex-col cursor-pointer"
                        onClick={() => setSelectedProduct(product)}
                      >
                        <CardHeader className="pb-3 flex-shrink-0">
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-3 overflow-hidden relative group">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                              />
                            ) : (
                              <Package className="h-12 w-12 text-muted-foreground" />
                            )}
                          </div>
                          <CardTitle className="text-base line-clamp-2 mb-1">{product.name}</CardTitle>
                          <CardDescription className="text-xs">SKU: {product.sku}</CardDescription>
                          
                          {/* Variant Selector */}
                          {product.variants_rel && product.variants_rel.length > 1 && (
                            <div 
                              className="mt-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ProductVariantSelector
                                variants={product.variants_rel}
                                selectedVariantId={selectedVariant?.id}
                                onVariantChange={(variant) => handleVariantChange(product.id, variant)}
                                size="sm"
                              />
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col justify-between">
                          <div className="space-y-2 mb-3">
                            {product.collection && (
                              <Badge variant="outline" className="text-xs">
                                {product.collection.name}
                              </Badge>
                            )}
                            {product.category && (
                              <Badge variant="secondary" className="text-xs ml-1">
                                {product.category}
                              </Badge>
                            )}
                            {product.variants_rel && product.variants_rel.length > 0 && (
                              <Badge variant="secondary" className="text-xs ml-1">
                                {product.variants_rel.length} variant{product.variants_rel.length !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-2 border-t pt-3">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold">{formatPrice(price)}</span>
                              {product.minimum_order_quantity > 1 && (
                                <span className="text-xs text-muted-foreground">
                                  Min: {product.minimum_order_quantity}
                                </span>
                              )}
                            </div>
                            {product.ddp_cost_per_unit && (
                              <div className="text-xs text-muted-foreground">
                                DDP: {formatDDP(product.ddp_cost_per_unit)}
                              </div>
                            )}
                            {product.product_summary && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {product.product_summary}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                              <span>Leads: {product.lead_count || 0}</span>
                              <span>•</span>
                              <span>Orders: {product.order_count || 0}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => {
                    const imageUrl = getProductImage(product)
                    const defaultVariant = getDefaultVariant(product)
                    const price = defaultVariant?.price || product.current_market_price

                    return (
                      <Card key={product.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-semibold text-base mb-1">{product.name}</h3>
                                  <p className="text-xs text-muted-foreground mb-2">SKU: {product.sku}</p>
                                  <div className="flex items-center gap-2 flex-wrap mb-2">
                                    {product.collection && (
                                      <Badge variant="outline" className="text-xs">
                                        {product.collection.name}
                                      </Badge>
                                    )}
                                    {product.category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {product.category}
                                      </Badge>
                                    )}
                                    {product.variants_rel && product.variants_rel.length > 0 && (
                                      <Badge variant="secondary" className="text-xs">
                                        {product.variants_rel.length} variant{product.variants_rel.length !== 1 ? 's' : ''}
                                      </Badge>
                                    )}
                                  </div>
                                  {product.product_summary && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                      {product.product_summary}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                  <span className="text-lg font-semibold">{formatPrice(price)}</span>
                                  {product.minimum_order_quantity > 1 && (
                                    <span className="text-xs text-muted-foreground">
                                      Min: {product.minimum_order_quantity}
                                    </span>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>Leads: {product.lead_count || 0}</span>
                                    <span>Orders: {product.order_count || 0}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProduct}
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      />
    </div>
  )
}