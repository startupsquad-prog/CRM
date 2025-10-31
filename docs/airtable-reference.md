# Airtable Integration Quick Reference

This is a quick reference guide for working with Airtable data in this project.

## Credentials

**Location**: `.env.local` (gitignored)

```env
AIRTABLE_ACCESS_TOKEN=your_airtable_personal_access_token_here
AIRTABLE_APP_ID=your_airtable_app_id_here
```

**Note**: Credentials are stored securely and will be used for future data fetches and migration.

## Fetching Data

To fetch fresh data from Airtable:

```bash
npx tsx scripts/fetch-airtable-data.ts
```

This will:
- Discover all tables in the Airtable base
- Fetch complete schemas for each table
- Download all records from each table
- Save data to `data/airtable/` directory

## Data Location

All fetched Airtable data is stored in: `crm-app/data/airtable/`

**Files**:
- `schema.json` - Complete schema for all tables
- `summary.json` - Summary of tables and record counts
- `table-mapping.json` - Mapping of table names to IDs
- `{TableName}.json` - Individual table data files

**Example**: `Leads.json`, `Products.json`, `Quotations.json`, etc.

## Documentation

**Comprehensive Documentation**:
- `docs/airtable-schema.md` - Complete schema documentation with field mappings
- `docs/airtable-to-supabase-migration-plan.md` - Detailed migration plan
- `docs/airtable-reference.md` - This quick reference

## Tables Overview

| Table | Records | Status |
|-------|---------|--------|
| Leads | 18 | Core CRM table |
| Products | 21 | Product catalog |
| Quotations | 69 | Sales proposals |
| Team | 6 | Employee info |
| Message Templates | 15 | Communication templates |
| Clients | 6 | Client/company data |
| Resources/Assets | 11 | Marketing assets |
| Orders | 0 | Order management (empty) |
| Transactions | 6 | Financial tracking |
| Freight | 4 | Shipping info |
| Employee Client FAQ | 25 | Knowledge base |

## Key Relationships

- **Leads** → Links to Products, Clients, Quotations
- **Quotations** → Links to Clients (multiple)
- **Products** → Referenced by Leads, Quotations

## Migration Status

**Current Phase**: Analysis & Planning ✅

- ✅ Data fetched and documented
- ✅ Schema analyzed
- ✅ Migration plan created
- ⏭️ Schema creation (next)
- ⏭️ Data migration (pending)

## Quick Commands

```bash
# Fetch fresh data from Airtable
npx tsx scripts/fetch-airtable-data.ts

# View schema summary
cat data/airtable/schema.json | jq

# View table summary
cat data/airtable/summary.json | jq

# Count records in a table
cat data/airtable/Leads.json | jq '.records | length'
```

## Important Notes

1. **Data Freshness**: Run the fetch script periodically to keep data current
2. **Image URLs**: Airtable image URLs may expire - download during migration
3. **Formulas**: Many calculated fields need to be recreated in Supabase
4. **Relationships**: Foreign keys need to be resolved during migration
5. **Attachments**: Product images need migration to Supabase Storage

## Next Steps

1. Review migration plan in `docs/airtable-to-supabase-migration-plan.md`
2. Create Supabase schema migrations
3. Write data migration scripts
4. Execute migration
5. Validate data integrity

---

**Last Updated**: 2025-10-31
**Data Fetched**: 2025-10-31
**Total Records**: 181

