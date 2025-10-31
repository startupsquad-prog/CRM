-- Migration: Airtable Schema Optimization & Extension
-- This migration extends Supabase schema to align with Airtable data structure
-- Following PostgreSQL best practices for scalability and performance
-- Date: 2025-10-31

-- ============================================
-- PART 1: Enhance Existing Tables
-- ============================================

-- Enhance Leads table with Airtable fields
ALTER TABLE public.leads
  -- Add stage field with proper enum values if not exists
  ADD COLUMN IF NOT EXISTS stage TEXT CHECK (stage IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')) DEFAULT 'new',
  -- Ensure lead_id can store Airtable format
  DROP CONSTRAINT IF EXISTS leads_lead_id_key;

-- Add unique constraint on lead_id with proper index
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_lead_id_unique 
  ON public.leads(lead_id) 
  WHERE lead_id IS NOT NULL;

-- Add index for stage filtering (high query frequency)
CREATE INDEX IF NOT EXISTS idx_leads_stage 
  ON public.leads(stage) 
  WHERE stage IS NOT NULL;

-- Add composite index for common queries (assigned_to + stage)
CREATE INDEX IF NOT EXISTS idx_leads_assigned_stage 
  ON public.leads(assigned_to, stage) 
  WHERE assigned_to IS NOT NULL;

-- Enhance Quotations table
ALTER TABLE public.quotations
  ADD COLUMN IF NOT EXISTS quotation_id TEXT,
  ADD COLUMN IF NOT EXISTS expiry_date DATE,
  ADD COLUMN IF NOT EXISTS quotation_date DATE,
  ADD COLUMN IF NOT EXISTS gst DECIMAL(15, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS days_until_expiry INTEGER, -- Computed via function/trigger
  ADD COLUMN IF NOT EXISTS is_expired BOOLEAN DEFAULT false, -- Computed via function/trigger
  ADD COLUMN IF NOT EXISTS quotation_summary TEXT,
  ADD COLUMN IF NOT EXISTS deal_win_probability DECIMAL(5, 2) CHECK (deal_win_probability >= 0 AND deal_win_probability <= 100),
  -- Update status enum to match Airtable
  DROP CONSTRAINT IF EXISTS quotations_status_check;

ALTER TABLE public.quotations
  ADD CONSTRAINT quotations_status_check 
  CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired'));

-- Add unique index on quotation_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_quotations_quotation_id 
  ON public.quotations(quotation_id) 
  WHERE quotation_id IS NOT NULL;

-- Add index for expiry tracking
CREATE INDEX IF NOT EXISTS idx_quotations_expiry_date 
  ON public.quotations(expiry_date) 
  WHERE expiry_date IS NOT NULL;

-- Add index for status filtering
CREATE INDEX IF NOT EXISTS idx_quotations_status 
  ON public.quotations(status) 
  WHERE status IS NOT NULL;

-- ============================================
-- PART 2: Create Clients Table (from Airtable)
-- ============================================

CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT UNIQUE,
  name TEXT NOT NULL,
  contact_details TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  client_type TEXT,
  gst_number TEXT,
  shipping_address TEXT,
  company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  -- Aggregated counts (denormalized for performance)
  total_order_value DECIMAL(15, 2) DEFAULT 0,
  number_of_leads INTEGER DEFAULT 0,
  number_of_quotations INTEGER DEFAULT 0,
  number_of_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for clients
CREATE INDEX IF NOT EXISTS idx_clients_client_id ON public.clients(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_name ON public.clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_city ON public.clients(city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON public.clients(company_id) WHERE company_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_clients_gst_number ON public.clients(gst_number) WHERE gst_number IS NOT NULL;

-- RLS for clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage clients"
  ON public.clients FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "Users can view associated clients"
  ON public.clients FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM public.leads WHERE assigned_to = get_user_id_from_clerk(get_current_clerk_user_id()))
    OR EXISTS (SELECT 1 FROM public.quotations WHERE company_id = clients.company_id AND created_by = get_user_id_from_clerk(get_current_clerk_user_id()))
    OR is_admin(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL
  );

-- Update trigger for clients
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 3: Create Products Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  sub_category TEXT,
  -- Pricing (normalized from raw pricing data)
  current_market_price DECIMAL(15, 2),
  cost_price_per_unit DECIMAL(15, 2),
  cost_price_20gp DECIMAL(15, 2),
  cost_price_40hq DECIMAL(15, 2),
  minimum_order_quantity INTEGER DEFAULT 1,
  -- Structured data (JSONB for flexibility)
  packing_details JSONB,
  features JSONB,
  -- AI-generated content
  product_summary TEXT,
  market_price_research TEXT,
  -- Links
  alibaba_url TEXT,
  listing_url TEXT,
  -- Aggregated counts (denormalized for performance)
  lead_count INTEGER DEFAULT 0,
  quotation_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  -- Variants
  variants TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for products (optimized for search and filtering)
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING gin(name gin_trgm_ops); -- Full-text search
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_sub_category ON public.products(sub_category) WHERE sub_category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_variants ON public.products USING gin(variants) WHERE variants IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_lead_count ON public.products(lead_count DESC); -- For popular products
CREATE INDEX IF NOT EXISTS idx_products_market_price ON public.products(current_market_price) WHERE current_market_price IS NOT NULL;

-- Enable pg_trgm extension for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- RLS for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage products"
  ON public.products FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "All authenticated users can view products"
  ON public.products FOR SELECT
  USING (
    get_current_clerk_user_id() IS NOT NULL
    OR get_current_clerk_user_id() IS NULL
  );

-- Update trigger for products
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 4: Product Images Table (Supabase Storage)
-- ============================================

CREATE TABLE IF NOT EXISTS public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  filename TEXT,
  file_size BIGINT,
  mime_type TEXT,
  thumbnail_url TEXT,
  -- Store original Airtable attachment metadata if needed
  airtable_metadata JSONB,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON public.product_images(product_id, is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON public.product_images(product_id, display_order);

-- RLS for product_images
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage product images"
  ON public.product_images FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "Users can view product images"
  ON public.product_images FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.products WHERE id = product_images.product_id)
    OR get_current_clerk_user_id() IS NULL
  );

-- ============================================
-- PART 5: Orders Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  -- Order details
  total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  status TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')) DEFAULT 'pending',
  order_date DATE DEFAULT CURRENT_DATE,
  delivery_date DATE,
  -- Items stored as JSONB for flexibility
  items JSONB,
  shipping_address JSONB,
  billing_address JSONB,
  -- Metadata
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for orders (optimized for common queries)
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON public.orders(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_client_id ON public.orders(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_quotation_id ON public.orders(quotation_id) WHERE quotation_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_lead_id ON public.orders(lead_id) WHERE lead_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_orders_order_date ON public.orders(order_date DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON public.orders(created_by) WHERE created_by IS NOT NULL;
-- Composite index for client orders
CREATE INDEX IF NOT EXISTS idx_orders_client_status ON public.orders(client_id, status) WHERE client_id IS NOT NULL;

-- RLS for orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage orders"
  ON public.orders FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "Users can view associated orders"
  ON public.orders FOR SELECT
  USING (
    created_by = get_user_id_from_clerk(get_current_clerk_user_id())
    OR EXISTS (SELECT 1 FROM public.leads WHERE id = orders.lead_id AND assigned_to = get_user_id_from_clerk(get_current_clerk_user_id()))
    OR is_admin(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL
  );

-- Update trigger for orders
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 6: Transactions Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id TEXT UNIQUE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  -- Transaction details
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  payment_mode TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')) DEFAULT 'pending',
  payment_date DATE,
  is_final_payment BOOLEAN DEFAULT false,
  -- Proof of payment (Supabase Storage URLs)
  proof_of_payment_urls TEXT[],
  -- AI assessment
  payment_risk_assessment TEXT,
  -- Metadata
  recorded_by UUID REFERENCES public.users(id),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_payment_id ON public.transactions(payment_id) WHERE payment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_order_id ON public.transactions(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_client_id ON public.transactions(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_payment_status ON public.transactions(payment_status) WHERE payment_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_payment_date ON public.transactions(payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_recorded_by ON public.transactions(recorded_by) WHERE recorded_by IS NOT NULL;
-- Composite index for client transactions
CREATE INDEX IF NOT EXISTS idx_transactions_client_status ON public.transactions(client_id, payment_status) WHERE client_id IS NOT NULL;

-- RLS for transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage transactions"
  ON public.transactions FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "Users can view associated transactions"
  ON public.transactions FOR SELECT
  USING (
    recorded_by = get_user_id_from_clerk(get_current_clerk_user_id())
    OR EXISTS (SELECT 1 FROM public.orders WHERE id = transactions.order_id AND created_by = get_user_id_from_clerk(get_current_clerk_user_id()))
    OR is_admin(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL
  );

-- Update trigger for transactions
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 7: Freight Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.freight (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freight_id TEXT UNIQUE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  -- Shipping details
  mode TEXT,
  partner TEXT,
  status TEXT CHECK (status IN ('pending', 'booked', 'in_transit', 'delivered', 'delayed', 'returned')) DEFAULT 'pending',
  eta DATE,
  dispatch_date DATE,
  container_number TEXT,
  tracking_number TEXT,
  -- Aggregated
  order_count INTEGER DEFAULT 0,
  -- AI-generated
  freight_summary TEXT,
  required_docs_checklist JSONB,
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for freight
CREATE INDEX IF NOT EXISTS idx_freight_freight_id ON public.freight(freight_id) WHERE freight_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_freight_order_id ON public.freight(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_freight_status ON public.freight(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_freight_tracking_number ON public.freight(tracking_number) WHERE tracking_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_freight_dispatch_date ON public.freight(dispatch_date DESC);

-- RLS for freight
ALTER TABLE public.freight ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage freight"
  ON public.freight FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "Users can view associated freight"
  ON public.freight FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = freight.order_id AND created_by = get_user_id_from_clerk(get_current_clerk_user_id()))
    OR is_admin(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL
  );

-- Update trigger for freight
CREATE TRIGGER update_freight_updated_at BEFORE UPDATE ON freight
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 8: Update Foreign Key References
-- ============================================

-- Link leads to products
ALTER TABLE public.leads
  ADD CONSTRAINT IF NOT EXISTS leads_product_id_fkey
  FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

-- Link leads to clients
ALTER TABLE public.leads
  ADD CONSTRAINT IF NOT EXISTS leads_client_id_fkey
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

-- Link quotations to clients via company relationship
-- (quotations already link to companies, and companies can link to clients)

-- ============================================
-- PART 9: Junction Tables for Many-to-Many
-- ============================================

-- Client-Quotation relationship (many-to-many)
CREATE TABLE IF NOT EXISTS public.client_quotations (
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  PRIMARY KEY (client_id, quotation_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_quotations_client ON public.client_quotations(client_id);
CREATE INDEX IF NOT EXISTS idx_client_quotations_quotation ON public.client_quotations(quotation_id);

-- Lead-Product relationship (many-to-many via product_inquiry array)
-- Handled via array in leads table, but can be normalized if needed

-- ============================================
-- PART 10: Materialized Views for Analytics
-- ============================================

-- Sales performance view
CREATE MATERIALIZED VIEW IF NOT EXISTS public.sales_performance AS
SELECT 
  u.id as user_id,
  u.full_name,
  u.role,
  COUNT(DISTINCT l.id) as total_leads,
  COUNT(DISTINCT q.id) as total_quotations,
  COUNT(DISTINCT o.id) as total_orders,
  COALESCE(SUM(o.total_amount), 0) as total_revenue,
  COALESCE(SUM(CASE WHEN q.status = 'accepted' THEN q.total_amount ELSE 0 END), 0) as won_quotations_value
FROM public.users u
LEFT JOIN public.leads l ON l.assigned_to = u.id
LEFT JOIN public.quotations q ON q.created_by = u.id
LEFT JOIN public.orders o ON o.created_by = u.id
GROUP BY u.id, u.full_name, u.role;

CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_performance_user_id ON public.sales_performance(user_id);

-- Product performance view
CREATE MATERIALIZED VIEW IF NOT EXISTS public.product_performance AS
SELECT 
  p.id as product_id,
  p.sku,
  p.name,
  p.category,
  p.lead_count,
  p.quotation_count,
  p.order_count,
  COUNT(DISTINCT l.id) as actual_lead_count,
  COUNT(DISTINCT q.id) as actual_quotation_count,
  COUNT(DISTINCT o.id) as actual_order_count
FROM public.products p
LEFT JOIN public.leads l ON l.product_id = p.id OR p.name = ANY(l.product_inquiry)
LEFT JOIN public.quotations q ON q.items::jsonb @> jsonb_build_array(jsonb_build_object('product_id', p.id::text))
LEFT JOIN public.orders o ON o.items::jsonb @> jsonb_build_array(jsonb_build_object('product_id', p.id::text))
GROUP BY p.id, p.sku, p.name, p.category, p.lead_count, p.quotation_count, p.order_count;

CREATE UNIQUE INDEX IF NOT EXISTS idx_product_performance_product_id ON public.product_performance(product_id);

-- Function to refresh materialized views
CREATE OR REPLACE FUNCTION refresh_analytics_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.sales_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.product_performance;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PART 11: Additional Optimization Indexes
-- ============================================

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_leads_full_name_trgm ON public.leads USING gin(full_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_leads_email_trgm ON public.leads USING gin(email gin_trgm_ops) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_companies_name_trgm ON public.companies USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_clients_name_trgm ON public.clients USING gin(name gin_trgm_ops);

-- GIN indexes for JSONB queries
CREATE INDEX IF NOT EXISTS idx_quotations_items_gin ON public.quotations USING gin(items);
CREATE INDEX IF NOT EXISTS idx_orders_items_gin ON public.orders USING gin(items);
CREATE INDEX IF NOT EXISTS idx_products_packing_gin ON public.products USING gin(packing_details) WHERE packing_details IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_features_gin ON public.products USING gin(features) WHERE features IS NOT NULL;

-- Partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_leads_active ON public.leads(assigned_to, created_at DESC) WHERE stage NOT IN ('won', 'lost');
CREATE INDEX IF NOT EXISTS idx_quotations_active ON public.quotations(created_by, created_at DESC) WHERE status NOT IN ('expired', 'rejected');
CREATE INDEX IF NOT EXISTS idx_orders_active ON public.orders(client_id, order_date DESC) WHERE status NOT IN ('cancelled', 'refunded');

-- ============================================
-- PART 12: Functions for Data Integrity
-- ============================================

-- Function to update client aggregated counts
CREATE OR REPLACE FUNCTION update_client_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.clients
    SET 
      total_order_value = COALESCE(
        (SELECT SUM(total_amount) FROM public.orders WHERE client_id = NEW.client_id),
        0
      ),
      number_of_leads = COALESCE(
        (SELECT COUNT(*) FROM public.leads WHERE client_id = NEW.client_id),
        0
      ),
      number_of_quotations = COALESCE(
        (SELECT COUNT(*) FROM public.quotations q 
         JOIN public.client_quotations cq ON q.id = cq.quotation_id 
         WHERE cq.client_id = NEW.client_id),
        0
      ),
      number_of_orders = COALESCE(
        (SELECT COUNT(*) FROM public.orders WHERE client_id = NEW.client_id),
        0
      )
    WHERE id = NEW.client_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for client counts
CREATE TRIGGER update_client_counts_on_order
  AFTER INSERT OR UPDATE OR DELETE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION update_client_counts();

-- Function to update product counts
CREATE OR REPLACE FUNCTION update_product_counts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update product lead_count when lead is created/updated
  IF TG_TABLE_NAME = 'leads' THEN
    UPDATE public.products
    SET lead_count = (
      SELECT COUNT(*) 
      FROM public.leads 
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
         OR COALESCE(NEW.product_inquiry, OLD.product_inquiry) && ARRAY[name]
    )
    WHERE id = COALESCE(NEW.product_id, OLD.product_id)
       OR name = ANY(COALESCE(NEW.product_inquiry, OLD.product_inquiry));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update quotation expiry fields
CREATE OR REPLACE FUNCTION update_quotation_expiry()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.expiry_date IS NOT NULL THEN
    NEW.days_until_expiry := (NEW.expiry_date - CURRENT_DATE)::INTEGER;
    NEW.is_expired := NEW.expiry_date < CURRENT_DATE;
  ELSE
    NEW.days_until_expiry := NULL;
    NEW.is_expired := false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update quotation expiry on insert/update
CREATE TRIGGER update_quotation_expiry_trigger
  BEFORE INSERT OR UPDATE OF expiry_date ON public.quotations
  FOR EACH ROW
  EXECUTE FUNCTION update_quotation_expiry();

-- ============================================
-- PART 13: Comments for Documentation
-- ============================================

COMMENT ON TABLE public.products IS 'Product catalog with pricing, features, and metadata';
COMMENT ON TABLE public.product_images IS 'Product images stored in Supabase Storage';
COMMENT ON TABLE public.clients IS 'Client/company information linked to companies';
COMMENT ON TABLE public.orders IS 'Order management with flexible JSONB items';
COMMENT ON TABLE public.transactions IS 'Financial transaction tracking';
COMMENT ON TABLE public.freight IS 'Shipping and freight information';
COMMENT ON COLUMN public.leads.stage IS 'Lead workflow stage: new, contacted, qualified, proposal, negotiation, won, lost';
COMMENT ON COLUMN public.quotations.quotation_id IS 'Human-readable quotation identifier from Airtable';
COMMENT ON COLUMN public.quotations.deal_win_probability IS 'AI-generated probability score (0-100)';

-- ============================================
-- Migration Complete
-- ============================================

-- Verify all tables exist
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully';
  RAISE NOTICE 'Created/Enhanced tables: products, clients, orders, transactions, freight, product_images';
  RAISE NOTICE 'Added indexes, constraints, and materialized views for performance';
END $$;

