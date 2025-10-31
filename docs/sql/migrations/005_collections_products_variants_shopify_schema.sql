-- Migration: Collections, Products, and Variants - Shopify-style Schema
-- This migration creates proper Shopify-like relationships between collections, products, and variants
-- Date: 2025-01-XX

-- ============================================
-- PART 1: Collections Table (Already exists, but ensure it's complete)
-- ============================================

-- Collections table should already exist, but let's ensure it has all Shopify-like fields
DO $$ 
BEGIN
  -- Add collection_type if it doesn't exist (manual, automated, smart collection types in Shopify)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'collections' AND column_name = 'collection_type'
  ) THEN
    ALTER TABLE public.collections 
    ADD COLUMN collection_type TEXT CHECK (collection_type IN ('manual', 'automated', 'smart')) DEFAULT 'manual';
  END IF;

  -- Add published_at if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'collections' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE public.collections 
    ADD COLUMN published_at TIMESTAMPTZ;
  END IF;

  -- Add meta fields for SEO
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'collections' AND column_name = 'meta_title'
  ) THEN
    ALTER TABLE public.collections 
    ADD COLUMN meta_title TEXT,
    ADD COLUMN meta_description TEXT;
  END IF;
END $$;

-- ============================================
-- PART 2: Create Junction Table for Collections-Products (Many-to-Many)
-- Shopify Model: Products can belong to multiple collections
-- ============================================

CREATE TABLE IF NOT EXISTS public.collection_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  -- Position/order of product within this collection (Shopify uses position)
  "position" INTEGER DEFAULT 0,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Unique constraint: product can only appear once per collection
  UNIQUE(collection_id, product_id)
);

-- Indexes for collection_products (optimized for common queries)
CREATE INDEX IF NOT EXISTS idx_collection_products_collection_id 
  ON public.collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product_id 
  ON public.collection_products(product_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_position 
  ON public.collection_products(collection_id, "position");

-- RLS for collection_products
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage collection_products"
  ON public.collection_products FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "All authenticated users can view collection_products"
  ON public.collection_products FOR SELECT
  USING (
    get_current_clerk_user_id() IS NOT NULL
    OR get_current_clerk_user_id() IS NULL
  );

-- Update trigger for collection_products
CREATE TRIGGER update_collection_products_updated_at 
  BEFORE UPDATE ON public.collection_products
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 3: Enhance Product Variants Table (Shopify-style)
-- ============================================

-- Add Shopify-like fields to product_variants if they don't exist
DO $$
BEGIN
  -- Add barcode if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'product_variants' AND column_name = 'barcode'
  ) THEN
    ALTER TABLE public.product_variants 
    ADD COLUMN barcode TEXT;
  END IF;

  -- Add compare_at_price (Shopify's original price before discount)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'product_variants' AND column_name = 'compare_at_price'
  ) THEN
    ALTER TABLE public.product_variants 
    ADD COLUMN compare_at_price NUMERIC(15, 2);
  END IF;

  -- Add weight fields (for shipping calculations)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'product_variants' AND column_name = 'weight'
  ) THEN
    ALTER TABLE public.product_variants 
    ADD COLUMN weight NUMERIC(10, 2),
    ADD COLUMN weight_unit TEXT DEFAULT 'kg' CHECK (weight_unit IN ('kg', 'g', 'lb', 'oz'));
  END IF;

  -- Add inventory tracking fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'product_variants' AND column_name = 'inventory_management'
  ) THEN
    ALTER TABLE public.product_variants 
    ADD COLUMN inventory_management TEXT CHECK (inventory_management IN ('shopify', 'not_tracked', 'custom')) DEFAULT 'not_tracked',
    ADD COLUMN inventory_policy TEXT CHECK (inventory_policy IN ('deny', 'continue')) DEFAULT 'deny',
    ADD COLUMN requires_shipping BOOLEAN DEFAULT true,
    ADD COLUMN taxable BOOLEAN DEFAULT true;
  END IF;

  -- Add tax_code if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'product_variants' AND column_name = 'tax_code'
  ) THEN
    ALTER TABLE public.product_variants 
    ADD COLUMN tax_code TEXT;
  END IF;
END $$;

-- Indexes for product_variants (additional indexes for new fields)
CREATE INDEX IF NOT EXISTS idx_product_variants_sku_unique 
  ON public.product_variants(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_barcode 
  ON public.product_variants(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_product_variants_is_active 
  ON public.product_variants(product_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_product_variants_stock_quantity 
  ON public.product_variants(product_id, stock_quantity) WHERE stock_quantity > 0;

-- Ensure updated_at trigger exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_product_variants_updated_at'
  ) THEN
    CREATE TRIGGER update_product_variants_updated_at 
      BEFORE UPDATE ON public.product_variants
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ============================================
-- PART 4: Enhance Products Table (Shopify compatibility)
-- ============================================

-- Add Shopify-like fields to products if they don't exist
DO $$
BEGIN
  -- Add product_type (Shopify field)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'product_type'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN product_type TEXT;
  END IF;

  -- Add vendor field (Shopify field)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'vendor'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN vendor TEXT;
  END IF;

  -- Add status (draft, active, archived)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN status TEXT CHECK (status IN ('draft', 'active', 'archived')) DEFAULT 'active';
  END IF;

  -- Add published_at
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'published_at'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN published_at TIMESTAMPTZ;
  END IF;

  -- Add tags array (Shopify uses comma-separated tags)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;

  -- Add SEO meta fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'meta_title'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN meta_title TEXT,
    ADD COLUMN meta_description TEXT;
  END IF;

  -- Add handle for URL-friendly slug (Shopify field)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'handle'
  ) THEN
    ALTER TABLE public.products 
    ADD COLUMN handle TEXT UNIQUE;
  END IF;
END $$;

-- Indexes for products (additional indexes)
CREATE INDEX IF NOT EXISTS idx_products_status 
  ON public.products(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_product_type 
  ON public.products(product_type) WHERE product_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_vendor 
  ON public.products(vendor) WHERE vendor IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_handle 
  ON public.products(handle) WHERE handle IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_tags 
  ON public.products USING gin(tags) WHERE tags IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_collection_id 
  ON public.products(collection_id) WHERE collection_id IS NOT NULL;

-- ============================================
-- PART 5: Data Migration (Backfill collection_products from collection_id)
-- ============================================

-- Migrate existing collection_id relationships to junction table
INSERT INTO public.collection_products (collection_id, product_id, "position", created_at, updated_at)
SELECT 
  collection_id,
  id as product_id,
  0 as "position", -- Default position
  created_at,
  updated_at
FROM public.products
WHERE collection_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.collection_products cp
    WHERE cp.collection_id = products.collection_id
      AND cp.product_id = products.id
  )
ON CONFLICT (collection_id, product_id) DO NOTHING;

-- ============================================
-- PART 6: Helper Functions for Collections
-- ============================================

-- Function to get all products in a collection
CREATE OR REPLACE FUNCTION get_collection_products(collection_uuid UUID)
RETURNS TABLE (
  product_id UUID,
  product_position INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.product_id,
    cp."position" as product_position
  FROM public.collection_products cp
  WHERE cp.collection_id = collection_uuid
  ORDER BY cp."position", cp.created_at;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get all collections for a product
CREATE OR REPLACE FUNCTION get_product_collections(product_uuid UUID)
RETURNS TABLE (
  collection_id UUID,
  collection_name TEXT,
  collection_position INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    cp."position" as collection_position
  FROM public.collection_products cp
  JOIN public.collections c ON c.id = cp.collection_id
  WHERE cp.product_id = product_uuid
  ORDER BY cp."position", cp.created_at;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- PART 7: Comments for Documentation
-- ============================================

COMMENT ON TABLE public.collections IS 'Product collections (Shopify-style). Can contain multiple products via collection_products junction table.';
COMMENT ON TABLE public.collection_products IS 'Junction table for many-to-many relationship between collections and products (Shopify model)';
COMMENT ON TABLE public.product_variants IS 'Product variants with Shopify-compatible fields: inventory, pricing, attributes, shipping';
COMMENT ON TABLE public.products IS 'Product catalog with Shopify-compatible fields: handle, product_type, vendor, tags, collections';

COMMENT ON COLUMN public.collections.collection_type IS 'Collection type: manual (manual curation), automated (rule-based), smart (dynamic)';
COMMENT ON COLUMN public.collection_products."position" IS 'Position/order of product within collection (Shopify-compatible)';
COMMENT ON COLUMN public.product_variants.inventory_management IS 'Inventory tracking: shopify (tracked), not_tracked, custom';
COMMENT ON COLUMN public.product_variants.inventory_policy IS 'Inventory policy: deny (prevent overselling), continue (allow overselling)';
COMMENT ON COLUMN public.products.handle IS 'URL-friendly product identifier (Shopify handle)';
COMMENT ON COLUMN public.products.collection_id IS 'Primary/default collection (legacy support). Use collection_products for multiple collections.';

-- ============================================
-- Migration Complete
-- ============================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully';
  RAISE NOTICE 'Created/Enhanced: collections, collection_products (junction), product_variants, products';
  RAISE NOTICE 'Shopify-style relationships: Collections ↔ Products (many-to-many), Products → Variants (one-to-many)';
  RAISE NOTICE 'Migrated existing collection_id relationships to collection_products junction table';
END $$;

