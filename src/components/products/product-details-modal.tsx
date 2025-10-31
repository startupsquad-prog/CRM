"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Product, ProductVariant, Collection } from "@/types/product"
import { ProductVariantSelector } from "./product-variant-selector"
import { Package, ExternalLink, DollarSign, ShoppingBag, TrendingUp, Grid3x3 } from "lucide-react"

interface ProductDetailsModalProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDetailsModal({ product, open, onOpenChange }: ProductDetailsModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)

  if (!product) return null

  const defaultVariant = product.variants_rel?.find(v => v.is_default) || product.variants_rel?.[0]
  const currentVariant = selectedVariant || defaultVariant

  const formatPrice = (price?: number) => {
    if (!price) return 'N/A'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price)
  }

  const formatDDP = (ddp?: number) => {
    if (!ddp) return 'N/A'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(ddp)
  }

  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0]
  const variantImage = currentVariant?.image_url

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          <DialogDescription>SKU: {product.sku}</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="variants">Variants</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  {variantImage ? (
                    <img
                      src={variantImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : primaryImage ? (
                    <img
                      src={primaryImage.image_url}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {product.variants_rel && product.variants_rel.length > 1 && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Variant:</label>
                    <ProductVariantSelector
                      variants={product.variants_rel}
                      selectedVariantId={currentVariant?.id}
                      onVariantChange={setSelectedVariant}
                      size="md"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Product Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU:</span>
                      <span className="font-medium">{product.sku}</span>
                    </div>
                    {product.category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Category:</span>
                        <Badge variant="secondary">{product.category}</Badge>
                      </div>
                    )}
                    {product.sub_category && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sub-Category:</span>
                        <span className="font-medium">{product.sub_category}</span>
                      </div>
                    )}
                    {product.vendor && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vendor:</span>
                        <span className="font-medium">{product.vendor}</span>
                      </div>
                    )}
                    {product.product_type && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium">{product.product_type}</span>
                      </div>
                    )}
                    {product.minimum_order_quantity > 1 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Min Order Quantity:</span>
                        <span className="font-medium">{product.minimum_order_quantity}</span>
                      </div>
                    )}
                    {product.factory_moq && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Factory MOQ:</span>
                        <span className="font-medium">{product.factory_moq}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {product.product_summary && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Summary</h4>
                    <p className="text-sm text-muted-foreground">{product.product_summary}</p>
                  </div>
                )}

                {(product.alibaba_url || product.listing_url) && (
                  <div className="flex gap-2">
                    {product.alibaba_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={product.alibaba_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Alibaba Listing
                        </a>
                      </Button>
                    )}
                    {product.listing_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={product.listing_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Listing
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {product.features && Object.keys(product.features).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Features</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.entries(product.features).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-muted-foreground">{key}:</span>{" "}
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-4 mt-4">
            {product.variants_rel && product.variants_rel.length > 0 ? (
              <div className="space-y-3">
                <div>
                  <ProductVariantSelector
                    variants={product.variants_rel}
                    selectedVariantId={currentVariant?.id}
                    onVariantChange={setSelectedVariant}
                    size="lg"
                  />
                </div>
                {currentVariant && (
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{currentVariant.name}</h4>
                        {currentVariant.sku && (
                          <p className="text-sm text-muted-foreground">SKU: {currentVariant.sku}</p>
                        )}
                      </div>
                      {currentVariant.is_default && (
                        <Badge>Default</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Price:</span>
                        <p className="font-semibold">{formatPrice(currentVariant.price)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cost:</span>
                        <p className="font-semibold">{formatPrice(currentVariant.cost_price)}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stock:</span>
                        <p className="font-semibold">{currentVariant.stock_quantity || 0}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p>
                          <Badge variant={currentVariant.is_active ? "default" : "secondary"}>
                            {currentVariant.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </p>
                      </div>
                    </div>
                    {currentVariant.attributes && Object.keys(currentVariant.attributes).length > 0 && (
                      <div>
                        <h5 className="text-sm font-semibold mb-2">Attributes</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(currentVariant.attributes).map(([key, value]) => (
                            <div key={key} className="text-sm">
                              <span className="text-muted-foreground">{key}:</span>{" "}
                              <span className="font-medium">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No variants available</p>
            )}
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-4 mt-4">
            {product.collection ? (
              <div className="space-y-3">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <Grid3x3 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h4 className="font-semibold">{product.collection.name}</h4>
                      {product.collection.description && (
                        <p className="text-sm text-muted-foreground">{product.collection.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Not in any collection</p>
            )}
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-semibold">Market Pricing</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Price:</span>
                    <span className="font-semibold">{formatPrice(product.current_market_price)}</span>
                  </div>
                  {currentVariant && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Variant Price:</span>
                        <span className="font-semibold">{formatPrice(currentVariant.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Cost Price:</span>
                        <span className="font-semibold">{formatPrice(currentVariant.cost_price)}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-semibold">Import Pricing (DDP)</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DDP Cost/Unit:</span>
                    <span className="font-semibold">{formatDDP(product.ddp_cost_per_unit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost Price/Unit:</span>
                    <span className="font-semibold">{formatPrice(product.cost_price_per_unit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">20GP Cost:</span>
                    <span className="font-semibold">{formatPrice(product.cost_price_20gp)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">40HQ Cost:</span>
                    <span className="font-semibold">{formatPrice(product.cost_price_40hq)}</span>
                  </div>
                </div>
              </div>
            </div>

            {product.factory_name && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Factory Information</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Factory:</span>
                    <span className="font-medium">{product.factory_name}</span>
                  </div>
                  {product.factory_location && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="font-medium">{product.factory_location}</span>
                    </div>
                  )}
                  {product.warranty_period_months && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Warranty:</span>
                      <span className="font-medium">{product.warranty_period_months} months</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-semibold">Leads</h4>
                </div>
                <p className="text-3xl font-bold">{product.lead_count || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Total inquiries</p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-semibold">Quotations</h4>
                </div>
                <p className="text-3xl font-bold">{product.quotation_count || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Quotes sent</p>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <h4 className="font-semibold">Orders</h4>
                </div>
                <p className="text-3xl font-bold">{product.order_count || 0}</p>
                <p className="text-sm text-muted-foreground mt-1">Total orders</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

