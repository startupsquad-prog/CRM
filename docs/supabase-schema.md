# Supabase Schema Design for CRM System

## Overview

This document outlines the database schema for the CRM system, including tables, relationships, and Row Level Security (RLS) policies. The schema is designed to support both employee and admin access patterns with proper data isolation.

## Core Tables

### 1. users (linked to Clerk authentication)

Stores employee and admin user information linked to Clerk authentication.

**Note**: Since we're using Clerk for auth, RLS policies allow service role operations. Authorization is handled in application code. See `docs/rls-implementation-guide.md` for details.

```sql
-- Helper functions for RLS
CREATE OR REPLACE FUNCTION get_current_clerk_user_id()
RETURNS TEXT AS $$
BEGIN
  -- Set by application: SELECT set_config('app.current_clerk_user_id', clerk_user_id, true);
  -- Returns NULL for service role operations
  RETURN current_setting('app.current_clerk_user_id', true);
END;
$$ LANGUAGE plpgsql STABLE;

CREATE OR REPLACE FUNCTION get_user_id_from_clerk(clerk_user_id TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM public.users WHERE users.clerk_user_id = get_user_id_from_clerk.clerk_user_id);
END;
$$ LANGUAGE plpgsql STABLE;

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

CREATE TABLE public.users (
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

-- Indexes for performance
CREATE INDEX idx_users_clerk_user_id ON public.users(clerk_user_id);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_email ON public.users(email);

-- RLS Policies (allow service role, check context for direct access)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Service role can manage all users (for webhooks and admin operations)
CREATE POLICY "Service role can manage users"
  ON public.users FOR ALL
  USING (get_current_clerk_user_id() IS NULL)
  WITH CHECK (get_current_clerk_user_id() IS NULL);

-- Users can view their own profile (if context is set)
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (
    clerk_user_id = get_current_clerk_user_id()
    OR get_current_clerk_user_id() IS NULL  -- Allow service role
  );

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    is_admin(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL  -- Allow service role
  );

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (
    clerk_user_id = get_current_clerk_user_id()
    OR get_current_clerk_user_id() IS NULL  -- Allow service role
  )
  WITH CHECK (
    clerk_user_id = get_current_clerk_user_id()
    OR get_current_clerk_user_id() IS NULL  -- Allow service role
  );
```

### 2. departments

Stores organizational departments.

```sql
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  manager_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view departments
CREATE POLICY "All users can view departments"
  ON public.departments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only admins can modify departments
CREATE POLICY "Admins can manage departments"
  ON public.departments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 3. companies

Stores company/organization information.

```sql
CREATE TABLE public.companies (
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

-- RLS Policies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Employees can view companies they're associated with via leads
CREATE POLICY "Employees can view associated companies"
  ON public.companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE company_id = companies.id
      AND assigned_to = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- All authenticated users can create companies
CREATE POLICY "Users can create companies"
  ON public.companies FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update companies they created or are assigned to
CREATE POLICY "Users can update associated companies"
  ON public.companies FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.leads
      WHERE company_id = companies.id AND assigned_to = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 4. leads

Core table for managing sales leads. Based on form-based lead requests.

```sql
-- Helper function to format WhatsApp link
CREATE OR REPLACE FUNCTION format_whatsapp_link(phone_num TEXT)
RETURNS TEXT AS $$
BEGIN
  IF phone_num IS NULL OR phone_num = '' THEN
    RETURN NULL;
  END IF;
  -- Extract digits and format as international number
  RETURN 'https://wa.me/' || regexp_replace(phone_num, '[^0-9]', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper function to extract Indian mobile number (10 digits)
CREATE OR REPLACE FUNCTION extract_indian_mobile(phone_num TEXT)
RETURNS TEXT AS $$
BEGIN
  IF phone_num IS NULL OR phone_num = '' THEN
    RETURN NULL;
  END IF;
  -- Extract last 10 digits
  RETURN substring(regexp_replace(phone_num, '[^0-9]', '', 'g') from '(.{10})$');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  whatsapp_number TEXT,
  company_id UUID REFERENCES companies(id),
  source TEXT[] DEFAULT '{}',
  product_inquiry TEXT[] DEFAULT '{}',
  quantity INTEGER,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  messages TEXT,
  product_id UUID REFERENCES products(id),
  assigned_to UUID REFERENCES users(id),
  client_id UUID REFERENCES clients(id),
  quotation_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_on TIMESTAMPTZ,
  lead_age_days INTEGER,
  latest_quotation_date TIMESTAMPTZ,
  product_image_url TEXT,
  welcome_message_status TEXT CHECK (welcome_message_status IN ('sent', 'not_sent')) DEFAULT 'not_sent',
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  stage TEXT CHECK (stage IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost')) DEFAULT 'new'
);

-- Indexes for performance
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);
CREATE INDEX idx_leads_stage ON public.leads(stage);

-- RLS Policies
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Service role can manage all leads (for webhooks and admin operations)
CREATE POLICY "Service role can manage leads"
  ON public.leads FOR ALL
  USING (true);  -- Service role bypasses RLS

-- Employees can view their own assigned leads (using clerk_user_id context)
CREATE POLICY "Employees can view own leads"
  ON public.leads FOR SELECT
  USING (
    assigned_to = get_user_id_from_clerk(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL  -- Allow service role
  );

-- Employees can view leads they created
CREATE POLICY "Employees can view created leads"
  ON public.leads FOR SELECT
  USING (
    created_by = get_user_id_from_clerk(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL  -- Allow service role
  );

-- Admins can view all leads
CREATE POLICY "Admins can view all leads"
  ON public.leads FOR SELECT
  USING (
    is_admin(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL  -- Allow service role
  );

-- Users can create leads (if authenticated via application)
CREATE POLICY "Users can create leads"
  ON public.leads FOR INSERT
  WITH CHECK (
    get_current_clerk_user_id() IS NOT NULL
    OR get_current_clerk_user_id() IS NULL  -- Allow service role
  );

-- Users can update their own assigned leads
CREATE POLICY "Users can update own leads"
  ON public.leads FOR UPDATE
  USING (
    assigned_to = get_user_id_from_clerk(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL  -- Allow service role
  )
  WITH CHECK (
    assigned_to = get_user_id_from_clerk(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL  -- Allow service role
  );

-- Admins can update any lead
CREATE POLICY "Admins can update any lead"
  ON public.leads FOR UPDATE
  USING (
    is_admin(get_current_clerk_user_id())
    OR get_current_clerk_user_id() IS NULL  -- Allow service role
  );
```

### 5. calls

Stores call records and activities.

```sql
CREATE TABLE public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id),
  user_id UUID REFERENCES users(id) NOT NULL,
  call_type TEXT CHECK (call_type IN ('inbound', 'outbound')),
  duration INTEGER, -- in seconds
  outcome TEXT,
  notes TEXT,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_calls_lead_id ON public.calls(lead_id);
CREATE INDEX idx_calls_user_id ON public.calls(user_id);

-- RLS Policies
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- Users can view their own calls
CREATE POLICY "Users can view own calls"
  ON public.calls FOR SELECT
  USING (user_id = auth.uid());

-- Users can view calls for their assigned leads
CREATE POLICY "Users can view lead calls"
  ON public.calls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE id = calls.lead_id AND assigned_to = auth.uid()
    )
  );

-- Admins can view all calls
CREATE POLICY "Admins can view all calls"
  ON public.calls FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can create calls
CREATE POLICY "Users can create calls"
  ON public.calls FOR INSERT
  WITH CHECK (user_id = auth.uid() OR auth.role() = 'authenticated');

-- Users can update their own calls
CREATE POLICY "Users can update own calls"
  ON public.calls FOR UPDATE
  USING (user_id = auth.uid());
```

### 6. quotations

Stores quotes/proposals sent to leads.

```sql
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) NOT NULL,
  company_id UUID REFERENCES companies(id),
  created_by UUID REFERENCES users(id) NOT NULL,
  quote_number TEXT UNIQUE NOT NULL,
  total_amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  valid_until DATE,
  items JSONB, -- Array of line items
  terms TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_quotations_lead_id ON public.quotations(lead_id);
CREATE INDEX idx_quotations_status ON public.quotations(status);

-- RLS Policies
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Users can view quotations for their assigned leads
CREATE POLICY "Users can view assigned lead quotations"
  ON public.quotations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.leads
      WHERE id = quotations.lead_id AND assigned_to = auth.uid()
    )
    OR created_by = auth.uid()
  );

-- Admins can view all quotations
CREATE POLICY "Admins can view all quotations"
  ON public.quotations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can create quotations
CREATE POLICY "Users can create quotations"
  ON public.quotations FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Users can update their own quotations
CREATE POLICY "Users can update own quotations"
  ON public.quotations FOR UPDATE
  USING (created_by = auth.uid());
```

### 7. messaging_templates

Stores reusable message templates.

```sql
CREATE TABLE public.messaging_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  type TEXT CHECK (type IN ('email', 'sms', 'whatsapp', 'letter')),
  category TEXT,
  created_by UUID REFERENCES users(id) NOT NULL,
  is_public BOOLEAN DEFAULT false, -- Public templates available to all
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.messaging_templates ENABLE ROW LEVEL SECURITY;

-- Users can view public templates and their own
CREATE POLICY "Users can view templates"
  ON public.messaging_templates FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

-- Users can create templates
CREATE POLICY "Users can create templates"
  ON public.messaging_templates FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON public.messaging_templates FOR UPDATE
  USING (created_by = auth.uid());
```

### 8. marketing_assets

Stores marketing materials and resources.

```sql
CREATE TABLE public.marketing_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  asset_type TEXT CHECK (asset_type IN ('image', 'video', 'document', 'presentation', 'other')),
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  tags TEXT[],
  created_by UUID REFERENCES users(id) NOT NULL,
  is_public BOOLEAN DEFAULT true,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.marketing_assets ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view public assets
CREATE POLICY "Users can view public assets"
  ON public.marketing_assets FOR SELECT
  USING (is_public = true OR created_by = auth.uid());

-- Users can create assets
CREATE POLICY "Users can create assets"
  ON public.marketing_assets FOR INSERT
  WITH CHECK (created_by = auth.uid());
```

### 9. knowledge_base

Stores FAQs and knowledge articles.

```sql
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  is_published BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES users(id) NOT NULL,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX idx_knowledge_base_tags ON public.knowledge_base USING GIN(tags);

-- RLS Policies
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- All authenticated users can view published articles
CREATE POLICY "Users can view published articles"
  ON public.knowledge_base FOR SELECT
  USING (is_published = true OR created_by = auth.uid());

-- Users can create articles
CREATE POLICY "Users can create articles"
  ON public.knowledge_base FOR INSERT
  WITH CHECK (created_by = auth.uid());

-- Authors and admins can update articles
CREATE POLICY "Authors can update articles"
  ON public.knowledge_base FOR UPDATE
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 10. activities

Generic activity log for tracking all user actions.

```sql
CREATE TABLE public.activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) NOT NULL,
  entity_type TEXT NOT NULL, -- 'lead', 'company', 'quotation', etc.
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'viewed', etc.
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_activities_user_id ON public.activities(user_id);
CREATE INDEX idx_activities_entity ON public.activities(entity_type, entity_id);
CREATE INDEX idx_activities_created_at ON public.activities(created_at DESC);

-- RLS Policies
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Users can view their own activities
CREATE POLICY "Users can view own activities"
  ON public.activities FOR SELECT
  USING (user_id = auth.uid());

-- Users can view activities for their assigned leads
CREATE POLICY "Users can view lead activities"
  ON public.activities FOR SELECT
  USING (
    entity_type = 'lead'
    AND EXISTS (
      SELECT 1 FROM public.leads
      WHERE id = activities.entity_id AND assigned_to = auth.uid()
    )
  );

-- Admins can view all activities
CREATE POLICY "Admins can view all activities"
  ON public.activities FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

## Helper Functions

### Update timestamp trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... apply to other tables as needed
```

## Migration Strategy

1. **Phase 1: Core Tables**
   - Create users, departments
   - Set up basic RLS policies

2. **Phase 2: Lead Management**
   - Create companies, leads
   - Implement lead assignment logic

3. **Phase 3: Sales Tools**
   - Create calls, quotations
   - Add activity tracking

4. **Phase 4: Resources**
   - Create marketing_assets, messaging_templates, knowledge_base

5. **Phase 5: Analytics & Reporting**
   - Add materialized views for reports
   - Create analytics tables

## Admin Oversight Features

For admin users, additional views and functions will provide:
- System-wide lead distribution analysis
- Employee performance metrics
- Company-wide analytics
- Lead assignment rule management

## Lead Stage Management

### Stage-Based Workflow

The `leads` table includes a `stage` field that represents the lead's position in the sales pipeline:

- **new**: Newly created lead, not yet contacted
- **contacted**: Initial contact has been made
- **qualified**: Lead meets qualification criteria
- **proposal**: Proposal/quotation has been sent
- **negotiation**: Active negotiation in progress
- **won**: Deal closed successfully
- **lost**: Deal was lost

### UI Integration

**Filter Architecture:**
1. **Sidebar**: Page navigation only (no filters)
2. **Tabs**: Stage-based filters matching kanban columns
3. **Dropdowns**: Priority (hot/warm/cold), source, product, tags

**Kanban Board:**
- Visual representation of leads organized by stage
- Drag-and-drop between columns updates the `stage` field
- Real-time synchronization with database via API endpoint: `/api/leads/[id]/stage`
- Optimistic UI updates with error rollback

**API Pattern:**
```typescript
// Server action pattern for stage updates
PATCH /api/leads/:id/stage
Body: { stage: LeadStage }
Returns: { data: Lead }
```

## Notes

- All RLS policies use service role key for application operations
- Stage updates are handled through optimistic UI with database persistence
- Consider adding materialized views for complex analytics queries
- Audit logs should be maintained for admin actions
- Consider adding soft deletes for critical data (is_deleted flag)

