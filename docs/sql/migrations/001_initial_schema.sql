-- Migration: Initial CRM Schema with Clerk Integration
-- This migration sets up the complete schema for Clerk + Supabase integration

-- ============================================
-- Helper Functions for RLS
-- ============================================

-- Function to get current clerk user ID from context
CREATE OR REPLACE FUNCTION get_current_clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  -- Set by application: SELECT set_config('app.current_clerk_user_id', clerk_user_id, true);
  -- Returns NULL for service role operations
  RETURN current_setting('app.current_clerk_user_id', true);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get Supabase user ID from Clerk user ID
CREATE OR REPLACE FUNCTION get_user_id_from_clerk(clerk_user_id TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM public.users WHERE users.clerk_user_id = get_user_id_from_clerk.clerk_user_id);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(clerk_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE users.clerk_user_id = is_admin.clerk_user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- Core Tables
-- ============================================

-- 1. Departments
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID, -- Will reference users after users table is created
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users (linked to Clerk)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')) DEFAULT 'employee',
  department_id UUID REFERENCES departments(id),
  phone TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update departments.manager_id to reference users
ALTER TABLE public.departments 
  ADD CONSTRAINT departments_manager_id_fkey 
  FOREIGN KEY (manager_id) REFERENCES public.users(id);

-- 3. Companies
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  company_size TEXT,
  annual_revenue DECIMAL(15, 2),
  description TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Leads
-- Helper functions for leads
CREATE OR REPLACE FUNCTION format_whatsapp_link(phone_num TEXT)
RETURNS TEXT AS $$
BEGIN
  IF phone_num IS NULL OR phone_num = '' THEN
    RETURN NULL;
  END IF;
  RETURN 'https://wa.me/' || regexp_replace(phone_num, '[^0-9]', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION extract_indian_mobile(phone_num TEXT)
RETURNS TEXT AS $$
BEGIN
  IF phone_num IS NULL OR phone_num = '' THEN
    RETURN NULL;
  END IF;
  RETURN substring(regexp_replace(phone_num, '[^0-9]', '', 'g') from '(.{10})$');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT UNIQUE GENERATED ALWAYS AS ('LD-' || LPAD(EXTRACT(EPOCH FROM created_at)::TEXT, 4, '0')) STORED,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT GENERATED ALWAYS AS (format_whatsapp_link(phone)) STORED,
  whatsapp_number TEXT GENERATED ALWAYS AS (extract_indian_mobile(phone)) STORED,
  source TEXT[] DEFAULT '{}',
  product_inquiry TEXT[] DEFAULT '{}',
  quantity INTEGER,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  messages TEXT,
  product_id UUID, -- Will reference products table
  assigned_to UUID REFERENCES users(id),
  client_id UUID, -- Will reference clients table
  quotation_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_on TIMESTAMPTZ GENERATED ALWAYS AS (created_at) STORED,
  lead_age_days INTEGER GENERATED ALWAYS AS (EXTRACT(DAY FROM NOW() - created_at)::INTEGER) STORED,
  latest_quotation_date TIMESTAMPTZ,
  product_image_url TEXT,
  welcome_message_status TEXT CHECK (welcome_message_status IN ('sent', 'not_sent')) DEFAULT 'not_sent',
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Calls
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  user_id UUID REFERENCES users(id) NOT NULL,
  call_type TEXT CHECK (call_type IN ('inbound', 'outbound')),
  duration INTEGER,
  outcome TEXT,
  notes TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Quotations
CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) NOT NULL,
  company_id UUID REFERENCES companies(id),
  created_by UUID REFERENCES users(id) NOT NULL,
  quote_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  valid_until DATE,
  items JSONB,
  terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_users_clerk_user_id ON public.users(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at);
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON public.calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_lead_id ON public.calls(lead_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Service role can manage users"
  ON public.users FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (
    clerk_user_id = get_current_clerk_user_id()
    OR get_current_clerk_user_id() IS NULL
  );

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    is_admin(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL
  );

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (
    clerk_user_id = get_current_clerk_user_id()
    OR get_current_clerk_user_id() IS NULL
  )
  WITH CHECK (
    clerk_user_id = get_current_clerk_user_id()
    OR get_current_clerk_user_id() IS NULL
  );

-- Departments policies
CREATE POLICY "Service role can manage departments"
  ON public.departments FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "All authenticated users can view departments"
  ON public.departments FOR SELECT
  USING (
    get_current_clerk_user_id() IS NOT NULL
    OR get_current_clerk_user_id() IS NULL
  );

-- Companies policies
CREATE POLICY "Service role can manage companies"
  ON public.companies FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

CREATE POLICY "Users can view associated companies"
  ON public.companies FOR SELECT
  USING (
    created_by = get_user_id_from_clerk(get_current_clerk_user_id())
    OR EXISTS (
      SELECT 1 FROM public.leads
      WHERE company_id = companies.id
      AND assigned_to = get_user_id_from_clerk(get_current_clerk_user_id())
    )
    OR is_admin(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL
  );

-- Leads policies
CREATE POLICY "Service role can manage leads"
  ON public.leads FOR ALL
  USING (true)
  WITH CHECK (true);

-- Calls policies
CREATE POLICY "Service role can manage calls"
  ON public.calls FOR ALL
  USING (true)
  WITH CHECK (true);

-- Quotations policies
CREATE POLICY "Service role can manage quotations"
  ON public.quotations FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- Update Timestamp Trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at BEFORE UPDATE ON quotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

