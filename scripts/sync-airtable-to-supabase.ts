/**
 * Airtable to Supabase Data Sync
 * 
 * This script reads Airtable JSON data files and pushes them to Supabase.
 * Uses Supabase client with service role key for bulk inserts.
 * 
 * Run with: npx tsx scripts/sync-airtable-to-supabase.ts
 */

import { readFileSync, readdirSync } from "fs"
import { resolve } from "path"
import { config } from "dotenv"
import { createClient } from "@supabase/supabase-js"

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") })

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ Missing Supabase credentials!")
  console.error("   Please set in .env.local:")
  if (!supabaseUrl) console.error("   - NEXT_PUBLIC_SUPABASE_URL")
  if (!supabaseServiceKey) console.error("   - SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Airtable to Supabase table mapping
const TABLE_MAPPING: Record<string, string> = {
  "Leads": "leads",
  "Products": "products",
  "Quotations": "quotations",
  "Team": "users",
  "Clients": "clients",
  "Orders": "orders",
  "Transactions": "transactions",
  "Freight": "freight",
}

// Field mappings for each table (Airtable field -> Supabase column)
const FIELD_MAPPINGS: Record<string, Record<string, string>> = {
  leads: {
    "Lead ID": "lead_id",
    "Full Name": "full_name",
    "Phone Number": "phone",
    "WhatsApp": "whatsapp",
    "Whatsapp Number": "whatsapp_number",
    "Source": "source",
    "Stage": "stage",
    "Created On": "created_on",
    "Lead Age (Days)": "lead_age_days",
    "Welcome Message Status ": "welcome_message_status",
    "Created": "created_at",
  },
  products: {
    "SKU/Model No.": "sku",
    "Product Name": "name",
    "Category": "category",
    "Sub Category": "sub_category",
    "Current Market Price (India)": "current_market_price",
    "Cost Price Per Unit": "cost_price_per_unit",
    "Cost Price (20GP)": "cost_price_20gp",
    "Cost Price (40HQ)": "cost_price_40hq",
    "Minimum Order Quantity": "minimum_order_quantity",
    "Product Summary": "product_summary",
    "Market Price Research": "market_price_research",
    "Alibaba URL": "alibaba_url",
    "Listing URL": "listing_url",
    "# of Leads": "lead_count",
    "# of Quotations": "quotation_count",
    "# of Orders": "order_count",
  },
  quotations: {
    "Quotation ID": "quotation_id",
    "Quote Number": "quote_number",
    "Total Amount": "total_amount",
    "Currency": "currency",
    "Status": "status",
    "Valid Until": "valid_until",
    "Expiry Date": "expiry_date",
    "Quotation Date": "quotation_date",
    "GST": "gst",
    "Days Until Expiry": "days_until_expiry",
    "Is Expired": "is_expired",
    "Quotation Summary": "quotation_summary",
    "Deal Win Probability": "deal_win_probability",
  },
  clients: {
    "Client ID": "client_id",
    "Name": "name",
    "Contact Details": "contact_details",
    "City": "city",
    "State": "state",
    "Country": "country",
    "Client Type": "client_type",
    "GST Number": "gst_number",
    "Shipping Address": "shipping_address",
  },
  orders: {
    "Order ID": "order_id",
    "Total Amount": "total_amount",
    "Currency": "currency",
    "Status": "status",
    "Order Date": "order_date",
    "Delivery Date": "delivery_date",
  },
  transactions: {
    "Payment ID": "payment_id",
    "Amount": "amount",
    "Currency": "currency",
    "Payment Mode": "payment_mode",
    "Payment Status": "payment_status",
    "Payment Date": "payment_date",
    "Is Final Payment": "is_final_payment",
  },
  freight: {
    "Freight ID": "freight_id",
    "Mode": "mode",
    "Partner": "partner",
    "Status": "status",
    "ETA": "eta",
    "Dispatch Date": "dispatch_date",
    "Container Number": "container_number",
    "Tracking Number": "tracking_number",
    "Order Count": "order_count",
    "Freight Summary": "freight_summary",
  },
  users: {
    "Full Name": "full_name",
    "Email": "email",
    "Phone": "phone",
    "Role": "role",
  },
}

// Helper to convert Airtable value to Supabase format
function convertValue(value: any, fieldType: string): any {
  if (value === null || value === undefined || value === "") {
    return null
  }

  // Handle arrays (multipleSelects, multipleRecordLinks)
  if (Array.isArray(value)) {
    if (value.length === 0) return null
    
    // Check if it's record links (objects with id) or strings
    if (value[0] && typeof value[0] === "object" && "id" in value[0]) {
      // For now, just extract the IDs - we'll handle relationships separately
      return value.map((v: any) => v.id || v.name || v).filter(Boolean)
    }
    // Multiple select - return as array
    return value
  }

  // Handle date strings
  if (fieldType === "dateTime" || fieldType === "date" || fieldType === "singleLineText") {
    // Try to parse as date if it looks like one
    if (typeof value === "string") {
      // Check if it's a date string
      const dateMatch = value.match(/\d{4}-\d{2}-\d{2}/)
      if (dateMatch) {
        try {
          const date = new Date(value)
          if (!isNaN(date.getTime())) {
            return date.toISOString()
          }
        } catch {
          // Not a valid date, return as string
        }
      }
    }
  }

  // Handle numbers
  if (fieldType === "number") {
    if (typeof value === "number") return value
    const parsed = parseFloat(value)
    return isNaN(parsed) ? null : parsed
  }

  // Handle booleans
  if (fieldType === "checkbox" || typeof value === "boolean") {
    return Boolean(value)
  }

  // Default: return as string
  return String(value)
}

// Parse date string from Airtable
function parseDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return null
    return date.toISOString()
  } catch {
    return null
  }
}

async function syncTable(tableName: string, supabaseTable: string) {
  const airtableDir = resolve(process.cwd(), "data", "airtable")
  const fileName = `${tableName}.json`
  const filePath = resolve(airtableDir, fileName)
  
  try {
    const fileContent = readFileSync(filePath, "utf-8")
    const data = JSON.parse(fileContent)
    
    if (!data.records || data.records.length === 0) {
      console.log(`   ⏭️  No records to sync`)
      return { inserted: 0, skipped: 0 }
    }

    const fieldMapping = FIELD_MAPPINGS[supabaseTable] || {}
    const recordsToInsert: any[] = []

    for (const record of data.records) {
      const fields = record.fields || {}
      const mappedRecord: any = {}

      // Map fields according to field mapping
      for (const [airtableField, supabaseColumn] of Object.entries(fieldMapping)) {
        const value = fields[airtableField]
        if (value !== undefined && value !== null && value !== "") {
          // Get field schema if available
          const fieldSchema = data.schema?.fields?.find((f: any) => f.name === airtableField)
          const fieldType = fieldSchema?.type || "singleLineText"
          mappedRecord[supabaseColumn] = convertValue(value, fieldType)
        }
      }

      // Handle special cases for each table
      if (tableName === "Leads") {
        // Source is an array in Supabase
        if (fields["Source"] && Array.isArray(fields["Source"])) {
          mappedRecord.source = fields["Source"]
        }
        // Product Inquiry might be an array
        if (fields["Product Inquiry"] && Array.isArray(fields["Product Inquiry"])) {
          mappedRecord.product_inquiry = fields["Product Inquiry"]
        }
        // Tags might be an array
        if (fields["Tags"] && Array.isArray(fields["Tags"])) {
          mappedRecord.tags = fields["Tags"]
        }
      }

      if (tableName === "Products") {
        // Variants might be an array
        if (fields["Variants"] && Array.isArray(fields["Variants"])) {
          mappedRecord.variants = fields["Variants"]
        }
      }

      // Set created_at from record createdTime if available
      if (record.createdTime && !mappedRecord.created_at) {
        mappedRecord.created_at = parseDate(record.createdTime)
      }

      // Only add if we have at least one mapped field
      if (Object.keys(mappedRecord).length > 0) {
        recordsToInsert.push(mappedRecord)
      }
    }

    if (recordsToInsert.length === 0) {
      console.log(`   ⚠️  No valid records to insert`)
      return { inserted: 0, skipped: 0 }
    }

    // Insert records in batches using Supabase client
    const batchSize = 100
    let inserted = 0
    let skipped = 0

    for (let i = 0; i < recordsToInsert.length; i += batchSize) {
      const batch = recordsToInsert.slice(i, i + batchSize)
      
      const { data: insertedData, error } = await supabase
        .from(supabaseTable)
        .upsert(batch, { onConflict: "id,lead_id,sku,quote_number,order_id,payment_id,freight_id,client_id" } as any)
        .select()

      if (error) {
        console.error(`   ❌ Error inserting batch:`, error.message)
        skipped += batch.length
      } else {
        inserted += insertedData?.length || batch.length
        console.log(`   ✓ Inserted batch ${Math.floor(i / batchSize) + 1} (${batch.length} records)`)
      }
    }

    return { inserted, skipped }

  } catch (error: any) {
    console.error(`   ❌ Error processing ${tableName}:`, error.message)
    return { inserted: 0, skipped: data.records?.length || 0 }
  }
}

async function syncAirtableToSupabase() {
  console.log("🚀 Starting Airtable to Supabase Sync...\n")

  // Process tables in dependency order
  const dependencyOrder = [
    { airtable: "Team", supabase: "users" },
    { airtable: "Products", supabase: "products" },
    { airtable: "Clients", supabase: "clients" },
    { airtable: "Leads", supabase: "leads" },
    { airtable: "Quotations", supabase: "quotations" },
    { airtable: "Orders", supabase: "orders" },
    { airtable: "Transactions", supabase: "transactions" },
    { airtable: "Freight", supabase: "freight" },
  ]

  let totalInserted = 0
  let totalSkipped = 0

  for (const { airtable, supabase: supabaseTable } of dependencyOrder) {
    if (!TABLE_MAPPING[airtable] || TABLE_MAPPING[airtable] !== supabaseTable) {
      continue
    }

    console.log(`📊 Syncing ${airtable} -> ${supabaseTable}`)
    
    const result = await syncTable(airtable, supabaseTable)
    totalInserted += result.inserted
    totalSkipped += result.skipped
    
    console.log(`   ✅ Inserted: ${result.inserted}, Skipped: ${result.skipped}\n`)
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("✅ Airtable to Supabase sync completed!")
  console.log(`   Total Inserted: ${totalInserted}`)
  console.log(`   Total Skipped: ${totalSkipped}`)
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
}

// Run the sync
syncAirtableToSupabase().catch((error) => {
  console.error("Fatal error:", error)
  process.exit(1)
})
