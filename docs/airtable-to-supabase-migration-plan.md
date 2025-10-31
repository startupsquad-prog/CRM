# Airtable to Supabase Migration Plan

This document outlines the comprehensive plan for migrating data and schema from Airtable to Supabase.

## Migration Overview

**Source**: Airtable Base `appx4nbOGbF7wkJ0V`
**Target**: Supabase PostgreSQL Database
**Tables to Migrate**: 11 tables
**Total Records**: 181 records (as of 2025-10-31)

## Migration Strategy

### Phase 1: Schema Analysis & Planning ✅

**Status**: COMPLETED

- [x] Fetch all Airtable data
- [x] Document table schemas
- [x] Map Airtable fields to PostgreSQL types
- [x] Identify relationships between tables
- [x] Create migration plan

**Output Files**:
- `data/airtable/*.json` - Raw data dumps
- `docs/airtable-schema.md` - Schema documentation
- `docs/airtable-to-supabase-migration-plan.md` - This plan

---

### Phase 2: Schema Creation & Enhancement

**Status**: PENDING

Create or enhance Supabase tables to match Airtable structure.

#### 2.1 Existing Tables to Enhance

**Leads Table** (`public.leads`)
- Current fields match well
- **Additions needed**:
  - `lead_id` TEXT (from Airtable "Lead ID") - Add UNIQUE constraint
  - `whatsapp_number` TEXT - Already exists
  - `lead_age_days` INTEGER - Add field
  - `welcome_message_status` TEXT - Already exists
  - Enhance stage field to match Airtable stages

**Quotations Table** (`public.quotations`)
- Current schema exists
- **Additions needed**:
  - `quotation_id` TEXT UNIQUE (from "Quotation ID")
  - `expiry_date` DATE (from "Expiry Date")
  - `days_until_expiry` INTEGER (calculated)
  - `is_expired` BOOLEAN (calculated)
  - `gst` DECIMAL(15, 2) (from "GST")
  - `quotation_summary` TEXT (for AI summary)
  - `deal_win_probability` DECIMAL(5, 2) (for AI probability)
  - Enhance status to match Airtable statuses

**Messaging Templates** (`public.messaging_templates`)
- Schema exists and matches
- May need minor adjustments

**Marketing Assets** (`public.marketing_assets`)
- Schema exists and matches
- Ready for migration

**Knowledge Base** (`public.knowledge_base`)
- Schema exists and matches
- Ready for migration

#### 2.2 New Tables to Create

**Products Table** (`public.products`)
```sql
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  sub_category TEXT,
  current_market_price DECIMAL(15, 2),
  cost_price_per_unit DECIMAL(15, 2),
  cost_price_20gp DECIMAL(15, 2),
  cost_price_40hq DECIMAL(15, 2),
  minimum_order_quantity INTEGER DEFAULT 1,
  packing_details JSONB,
  features JSONB,
  product_summary TEXT,
  market_price_research TEXT,
  lead_count INTEGER DEFAULT 0,
  quotation_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Image storage handled via Supabase Storage
-- Store image URLs in a separate table or JSONB field
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  filename TEXT,
  file_size BIGINT,
  mime_type TEXT,
  thumbnail_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Clients Table** (`public.clients`)
```sql
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  state TEXT,
  country TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link clients to companies if needed
ALTER TABLE public.clients 
ADD COLUMN company_id UUID REFERENCES companies(id);
```

**Orders Table** (`public.orders`)
```sql
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE,
  client_id UUID REFERENCES clients(id),
  quotation_id UUID REFERENCES quotations(id),
  lead_id UUID REFERENCES leads(id),
  total_amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  order_date DATE,
  delivery_date DATE,
  items JSONB,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Transactions Table** (`public.transactions`)
```sql
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id TEXT UNIQUE,
  order_id UUID REFERENCES orders(id),
  quotation_id UUID REFERENCES quotations(id),
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  transaction_type TEXT CHECK (transaction_type IN ('payment', 'refund', 'adjustment')),
  payment_method TEXT,
  status TEXT CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Freight Table** (`public.freight`)
```sql
CREATE TABLE public.freight (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  freight_cost DECIMAL(15, 2),
  carrier TEXT,
  tracking_number TEXT,
  shipping_address JSONB,
  estimated_delivery_date DATE,
  actual_delivery_date DATE,
  status TEXT CHECK (status IN ('pending', 'in_transit', 'delivered', 'returned')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Team Table Mapping**
- Map to existing `users` table
- No separate table needed
- Enhance `users` table if additional fields are needed

---

### Phase 3: Data Migration Scripts

**Status**: PENDING

Create TypeScript scripts to migrate data from Airtable JSON files to Supabase.

#### 3.1 Migration Script Structure

```typescript
// scripts/migrate-airtable-to-supabase.ts
// - Load JSON files from data/airtable/
// - Transform Airtable data to Supabase format
// - Handle relationships and foreign keys
// - Insert data into Supabase
// - Validate migration
```

#### 3.2 Data Transformation Requirements

**Leads Migration**:
- Map Airtable "Lead ID" to `lead_id`
- Transform stage emoji to enum values
- Parse WhatsApp links
- Handle product inquiry arrays
- Link to products via product names

**Products Migration**:
- Migrate SKU, name, category
- Parse pricing information from "Price - Raw"
- Extract packing details and features
- **Image Migration**: Download images from Airtable URLs and upload to Supabase Storage
- Generate new image URLs

**Quotations Migration**:
- Map quotation IDs
- Resolve client relationships (may need fuzzy matching)
- Calculate expiry dates and status
- Parse notes and terms

**Relationships**:
- Resolve foreign key relationships
- Handle multiple record links
- Create junction tables if needed

#### 3.3 Image/Attachment Migration

**Strategy**:
1. Download all product images from Airtable URLs
2. Upload to Supabase Storage bucket: `product-images`
3. Create `product_images` records with new URLs
4. Update products table with primary image reference

**Script**: `scripts/migrate-images.ts`

---

### Phase 4: Validation & Testing

**Status**: PENDING

1. **Data Validation**:
   - Verify record counts match
   - Check foreign key integrity
   - Validate required fields
   - Spot-check data accuracy

2. **Relationship Validation**:
   - Verify all relationships are preserved
   - Check junction tables
   - Validate foreign keys

3. **Functional Testing**:
   - Test CRUD operations on migrated data
   - Verify frontend integration
   - Test queries and filters

---

### Phase 5: Frontend Integration Updates

**Status**: PENDING

1. **Update API Routes**:
   - Modify `/api/leads` to use new schema
   - Update quotation endpoints
   - Add product endpoints

2. **Update Components**:
   - Leads table component
   - Quotations display
   - Product catalog (new)

3. **Add New Features**:
   - Product browsing and search
   - Order management UI
   - Transaction tracking

---

### Phase 6: Post-Migration Cleanup

**Status**: PENDING

1. **Archive Airtable Data**:
   - Keep JSON dumps as backup
   - Document any data loss or transformations

2. **Update Documentation**:
   - Update schema documentation
   - Document new tables
   - Update API documentation

3. **Performance Optimization**:
   - Add indexes for frequently queried fields
   - Optimize queries
   - Add materialized views if needed

---

## Migration Execution Order

1. **Schema Migration** (Phase 2)
   - Create new tables
   - Enhance existing tables
   - Add foreign key constraints
   - Add indexes

2. **Image Migration** (Phase 3.3)
   - Upload images to Supabase Storage
   - Create image records

3. **Data Migration** (Phase 3)
   - Migrate base tables (Products, Clients)
   - Migrate related tables (Leads, Quotations)
   - Migrate reference tables (Templates, Assets, FAQ)
   - Migrate transactional tables (Orders, Transactions, Freight)

4. **Relationship Establishment** (Phase 3.2)
   - Resolve foreign keys
   - Create junction tables
   - Validate relationships

5. **Validation** (Phase 4)
   - Run validation scripts
   - Fix any issues
   - Verify data integrity

6. **Frontend Updates** (Phase 5)
   - Update components
   - Test integration
   - Fix any bugs

---

## Risk Mitigation

### Data Loss Prevention
- ✅ Full data backup in JSON files
- ⚠️ Image URLs may expire (download immediately)
- ⚠️ Formula fields need recalculation

### Relationship Integrity
- ⚠️ Foreign key resolution (fuzzy matching may be needed)
- ⚠️ Multiple record links need junction tables
- ⚠️ Handle missing relationships gracefully

### Performance Concerns
- ⚠️ Large image uploads may be slow
- ⚠️ Batch inserts for large tables
- ⚠️ Index creation after data load for speed

### Data Transformation Issues
- ⚠️ Date format conversions
- ⚠️ Enum value mappings
- ⚠️ Text parsing (pricing, features, etc.)

---

## Estimated Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Analysis | ✅ COMPLETE | - |
| Phase 2: Schema | 2-3 hours | Phase 1 |
| Phase 3: Data Migration | 4-6 hours | Phase 2 |
| Phase 3.3: Images | 2-3 hours | Phase 2 |
| Phase 4: Validation | 1-2 hours | Phase 3 |
| Phase 5: Frontend | 4-6 hours | Phase 4 |
| Phase 6: Cleanup | 1 hour | Phase 5 |
| **Total** | **14-21 hours** | - |

---

## Migration Scripts to Create

1. `scripts/migrate-airtable-to-supabase.ts` - Main migration script
2. `scripts/migrate-images.ts` - Image migration
3. `scripts/validate-migration.ts` - Data validation
4. `docs/sql/migrations/002_airtable_schema_enhancements.sql` - Schema updates
5. `docs/sql/migrations/003_airtable_new_tables.sql` - New tables

---

## Next Immediate Steps

1. ✅ Review Airtable schema documentation
2. ⏭️ Create Supabase schema migration SQL
3. ⏭️ Write data migration scripts
4. ⏭️ Test migration on staging/dry-run
5. ⏭️ Execute production migration
6. ⏭️ Validate and fix issues
7. ⏭️ Update frontend

---

## Notes

- Airtable credentials are stored in `.env.local` (gitignored)
- All fetched data is in `data/airtable/` (consider adding to .gitignore)
- Run `npx tsx scripts/fetch-airtable-data.ts` to refresh data
- Migration should be done in a transaction where possible
- Keep Airtable as backup until migration is fully validated

---

## Success Criteria

- [ ] All 11 tables migrated
- [ ] All 181+ records migrated
- [ ] All relationships preserved
- [ ] All images uploaded to Supabase Storage
- [ ] Frontend fully functional with new data
- [ ] Performance acceptable
- [ ] Data validation passes
- [ ] No data loss
- [ ] Documentation updated

