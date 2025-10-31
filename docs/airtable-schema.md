# Airtable Schema Documentation

This document provides a comprehensive overview of the Airtable base structure, tables, fields, and data relationships. This serves as a baseline reference for migrating to Supabase.

## Overview

- **Airtable App ID**: `appx4nbOGbF7wkJ0V`
- **Total Tables**: 11
- **Total Records**: 181
- **Data Fetched**: 2025-10-31

## Tables Summary

| Table Name | Table ID | Record Count | Description |
|------------|----------|--------------|-------------|
| Leads | tblwQNcyhLvBrPH1L | 18 | Lead management and tracking |
| Products | tblKQj1OwKMDVMWC1 | 21 | Product catalog with pricing and features |
| Quotations | tbl3imcRaJth1KlaS | 69 | Sales quotations and proposals |
| Team | tblsvHDHNlWG0zmx0 | 6 | Team/employee information |
| Message Templates | tbl2TEQifkZFxuO0q | 15 | Reusable messaging templates |
| Clients | tblmP2WYWkbSmllAK | 6 | Client/company information |
| Resources/Assets | tblzadFRU2j3Xykra | 11 | Marketing assets and resources |
| Orders | tbl5XvWQzsLt8YBq3 | 0 | Order management (currently empty) |
| Transactions | tblxeIAJMNBBGQIkL | 6 | Financial transactions |
| Freight | tblvu82uQ1zLGbcnV | 4 | Shipping/freight information |
| Employee Client FAQ | tblTBLBaly0kdAWtk | 25 | Knowledge base and FAQs |

---

## Detailed Table Schemas

### 1. Leads Table

**Purpose**: Primary lead management and tracking system.

**Key Fields** (based on sample records):
- `Lead ID` (text) - Unique identifier like "LD-0025"
- `Source` (multiple select) - Lead source (e.g., "Website")
- `Stage` (text) - Lead stage (e.g., "🟢 New Lead")
- `Created On` (dateTime) - Creation timestamp
- `Lead Age (Days)` (number) - Calculated age
- `Full Name` (text) - Contact name
- `Email Address` (email) - Contact email (optional)
- `Phone Number` (text) - Formatted phone number
- `WhatsApp` (url) - WhatsApp link
- `Whatsapp Number` (text) - Phone number in WhatsApp format
- `Product Inquiry` (multiple select) - Products of interest
- `Quantity (Approx.)` (number) - Approximate quantity needed
- `ID` (number) - Numeric ID
- `Welcome Message Status ` (text) - Status of welcome message
- `Created` (date) - Creation date
- `Open Whatsapp` (formula/button) - Calculated WhatsApp link

**Relationships**:
- May link to Products via Product Inquiry
- May link to Clients
- May link to Quotations

**Supabase Mapping**:
- Primary table: `leads`
- Fields map to existing `leads` schema with some additions

---

### 2. Products Table

**Purpose**: Product catalog with detailed information, pricing, and images.

**Key Fields**:
- `SKU/Model No.` (text) - Product SKU (e.g., "YJ-S9A")
- `Product Name` (text) - Product name
- `Category` (single select) - Product category (e.g., "Health")
- `Sub Category` (text) - Subcategory (e.g., "Massager")
- `Product Images - Raw` (multiple attachments) - Product images with metadata
- `Current Market Price (India)` (number) - Market price
- `Cost Price` (formula/generated) - Calculated cost price from raw data
- `Price - Raw` (text) - Raw pricing information
- `Minimum Order Quantity` (number) - MOQ
- `Packing Details - Raw` (text) - Raw packing information
- `Packing Details` (formula/generated) - Formatted packing details
- `Features - Raw` (text) - Raw feature list
- `Features` (formula/generated) - Formatted features
- `Product Summary (AI)` (formula) - AI-generated summary
- `Market Price Research (AI)` (formula) - AI research data
- `# of Leads` (number) - Count of associated leads
- `# of Quotations` (number) - Count of quotations
- `# of Orders` (number) - Count of orders

**Relationships**:
- Links to Leads via Product Inquiry
- Links to Quotations

**Supabase Mapping**:
- New table: `products` (not in current schema)
- Requires image storage (Supabase Storage)

---

### 3. Quotations Table

**Purpose**: Sales quotations and proposals management.

**Key Fields**:
- `Quotation ID` (text) - Unique ID (e.g., "Q-00026")
- `Client` (multiple record links) - Links to Clients table
- `Total Cost` (number) - Total quotation amount
- `GST` (number) - GST amount
- `Status` (single select) - Status (Draft, Sent, Accepted, Rejected, Expired)
- `Quotation Date` (date) - Date of quotation
- `Expiry Date` (date) - Quotation expiry
- `Days Until Expiry` (formula) - Calculated days
- `Is Expired?` (formula) - Expiry status
- `Client City` (formula) - Extracted from client
- `Notes` (long text) - Detailed notes and terms
- `Quotation Summary (AI)` (formula) - AI-generated summary
- `Deal Win Probability (AI)` (formula) - AI probability score

**Relationships**:
- Links to Clients (multiple)
- May link to Leads

**Supabase Mapping**:
- Primary table: `quotations`
- Enhance existing schema with new fields

---

### 4. Team Table

**Purpose**: Team/employee information.

**Record Count**: 6

**Supabase Mapping**:
- Map to existing `users` table
- May also use `departments` table

---

### 5. Message Templates Table

**Purpose**: Reusable messaging templates for communications.

**Record Count**: 15

**Key Fields** (inferred):
- Template name
- Template content
- Template type (email, SMS, WhatsApp, etc.)
- Category

**Supabase Mapping**:
- Primary table: `messaging_templates`
- Matches existing schema structure

---

### 6. Clients Table

**Purpose**: Client/company information.

**Record Count**: 6

**Key Fields** (based on relationships):
- Client name
- City
- Contact information
- Possibly address, state, etc.

**Relationships**:
- Links to Quotations
- May link to Leads

**Supabase Mapping**:
- Primary table: `companies` or `clients`
- May need new `clients` table or extend `companies`

---

### 7. Resources/Assets Table

**Purpose**: Marketing assets and resources.

**Record Count**: 11

**Supabase Mapping**:
- Primary table: `marketing_assets`
- Matches existing schema

---

### 8. Orders Table

**Purpose**: Order management.

**Record Count**: 0 (currently empty)

**Supabase Mapping**:
- New table: `orders` (not in current schema)
- Will need to be created

---

### 9. Transactions Table

**Purpose**: Financial transactions tracking.

**Record Count**: 6

**Supabase Mapping**:
- New table: `transactions` (not in current schema)
- Financial/payment tracking

---

### 10. Freight Table

**Purpose**: Shipping and freight information.

**Record Count**: 4

**Supabase Mapping**:
- New table: `freight` or extend orders
- Shipping logistics

---

### 11. Employee Client FAQ Table

**Purpose**: Knowledge base and frequently asked questions.

**Record Count**: 25

**Key Fields** (inferred):
- Question/Title
- Answer/Content
- Category
- Tags

**Supabase Mapping**:
- Primary table: `knowledge_base`
- Matches existing schema structure

---

## Data Relationships

```
Leads
├── Links to: Products (via Product Inquiry)
├── Links to: Clients
└── Links to: Quotations

Products
├── Referenced by: Leads
└── Referenced by: Quotations

Quotations
├── Links to: Clients (multiple)
└── May link to: Leads

Clients
├── Referenced by: Quotations
└── May link to: Leads

Team
└── May link to: Leads (assignment)
```

---

## Field Type Mappings

| Airtable Type | Supabase/PostgreSQL Type | Notes |
|--------------|--------------------------|-------|
| singleLineText | TEXT | Standard text field |
| multipleLineText | TEXT | Long text field |
| email | TEXT with validation | Email field |
| url | TEXT | URL field |
| number | DECIMAL or INTEGER | Numeric field |
| date | DATE | Date field |
| dateTime | TIMESTAMPTZ | Timestamp field |
| checkbox | BOOLEAN | Boolean field |
| multipleSelects | TEXT[] | Array of strings |
| singleRecordLink | UUID (FK) | Foreign key reference |
| multipleRecordLinks | UUID[] | Array of foreign keys |
| formula | Computed column or application logic | Calculated fields |
| attachment | Storage URL (TEXT) | File/image references |

---

## Key Observations

1. **Lead Management**: The Leads table is the core of the CRM, with detailed tracking of lead stages and communication.

2. **Product Catalog**: Products table includes rich metadata, images, and AI-generated summaries. Will need image storage migration.

3. **Quotation System**: Complex quotations with client relationships, expiry tracking, and AI insights.

4. **Missing Tables**: Orders and Transactions tables exist but are mostly empty, indicating future use.

5. **AI Features**: Multiple AI-generated fields (summaries, research, probabilities) - these may need to be migrated or regenerated in Supabase.

6. **Attachments**: Product images stored as attachments - will need migration to Supabase Storage.

7. **Formulas**: Many calculated/formula fields that may need to be:
   - Converted to PostgreSQL computed columns
   - Handled in application code
   - Recalculated during migration

---

## Next Steps

1. Review detailed field mappings for each table
2. Create Supabase migration scripts
3. Plan data migration strategy
4. Handle attachment/image migration
5. Set up computed columns or application logic for formulas
6. Establish proper foreign key relationships

---

## Data Location

All fetched data is stored in: `crm-app/data/airtable/`

- Individual table JSON files: `{TableName}.json`
- Schema summary: `schema.json`
- Data summary: `summary.json`
- Table mapping: `table-mapping.json`

Run the fetch script again to refresh data:
```bash
npx tsx scripts/fetch-airtable-data.ts
```

