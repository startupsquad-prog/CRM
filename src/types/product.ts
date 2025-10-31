export interface Collection {
  id: string
  name: string
  description?: string
  slug?: string
  image_url?: string
  display_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku?: string
  price?: number
  cost_price?: number
  stock_quantity: number
  attributes?: Record<string, any>
  image_url?: string
  is_default: boolean
  is_active: boolean
  display_order: number
  created_at?: string
  updated_at?: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  filename?: string
  file_size?: number
  mime_type?: string
  thumbnail_url?: string
  display_order: number
  is_primary: boolean
  created_at?: string
}

export interface Product {
  id: string
  sku: string
  name: string
  category?: string
  sub_category?: string
  current_market_price?: number
  cost_price_per_unit?: number
  cost_price_20gp?: number
  cost_price_40hq?: number
  minimum_order_quantity: number
  packing_details?: Record<string, any>
  features?: Record<string, any>
  product_summary?: string
  market_price_research?: string
  alibaba_url?: string
  listing_url?: string
  lead_count: number
  quotation_count: number
  order_count: number
  variants?: string[] // Legacy array field
  collection_id?: string
  created_at?: string
  updated_at?: string
  // Relations (from joins)
  collection?: Collection
  images?: ProductImage[]
  variants_rel?: ProductVariant[]
  // OLLDeals-specific fields
  supplier_id?: string // Linked to companies (supplier/factory)
  factory_name?: string
  factory_location?: string
  ddp_cost_per_unit?: number // DDP cost per unit
  factory_moq?: number // Factory minimum order quantity
  warranty_period_months?: number // Factory warranty period
}

