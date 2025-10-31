/**
 * Airtable to Supabase Data Sync using Supabase MCP
 * 
 * This script reads Airtable JSON data files and pushes them to Supabase
 * using Supabase MCP execute_sql.
 * 
 * Run with: npx tsx scripts/sync-airtable-to-supabase-mcp.ts
 */

import { readFileSync, readdirSync } from "fs"
import { resolve } from "path"

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

// Field mappings for each table
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

function escapeSQLString(value: any): string {
  if (value === null || value === undefined) return "NULL"
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE"
  if (typeof value === "number") return String(value)
  if (Array.isArray(value)) {
    // Convert array to PostgreSQL array format
    const escapedItems = value.map(item => {
      if (typeof item === "string") {
        return `"${item.replace(/"/g, '\\"')}"`
      }
      return String(item)
    })
    return `ARRAY[${escapedItems.join(", ")}]::text[]`
  }
  // Escape string
  return `'${String(value).replace(/'/g, "''").replace(/\\/g, "\\\\")}'`
}

function convertValue(value: any, fieldType: string): any {
  if (value === null || value === undefined || value === "") return null

  if (Array.isArray(value)) {
    if (value.length === 0) return null
    // If it's record links, extract IDs
    if (value[0] && typeof value[0] === "object" && "id" in value[0]) {
      return value.map((v: any) => v.id || v.name || v).filter(Boolean)
    }
    return value
  }

  // Try to parse dates
  if (typeof value === "string") {
    const dateMatch = value.match(/\d{4}-\d{2}-\d{2}/)
    if (dateMatch) {
      try {
        const date = new Date(value)
        if (!isNaN(date.getTime())) {
          return date.toISOString()
        }
      } catch {
        // Not a valid date
      }
    }
  }

  if (fieldType === "number") {
    if (typeof value === "number") return value
    const parsed = parseFloat(value)
    return isNaN(parsed) ? null : parsed
  }

  if (fieldType === "checkbox" || typeof value === "boolean") {
    return Boolean(value)
  }

  return String(value)
}

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

async function generateInsertSQL(tableName: string, supabaseTable: string): Promise<string> {
  const airtableDir = resolve(process.cwd(), "data", "airtable")
  const fileName = `${tableName}.json`
  const filePath = resolve(airtableDir, fileName)
  
  try {
    const fileContent = readFileSync(filePath, "utf-8")
    const data = JSON.parse(fileContent)
    
    if (!data.records || data.records.length === 0) {
      return ""
    }

    const fieldMapping = FIELD_MAPPINGS[supabaseTable] || {}
    const recordsToInsert: any[] = []

    for (const record of data.records) {
      const fields = record.fields || {}
      const mappedRecord: any = {}

      // Map fields
      for (const [airtableField, supabaseColumn] of Object.entries(fieldMapping)) {
        const value = fields[airtableField]
        if (value !== undefined && value !== null && value !== "") {
          const fieldSchema = data.schema?.fields?.find((f: any) => f.name === airtableField)
          const fieldType = fieldSchema?.type || "singleLineText"
          mappedRecord[supabaseColumn] = convertValue(value, fieldType)
        }
      }

      // Handle special cases
      if (tableName === "Leads") {
        if (fields["Source"] && Array.isArray(fields["Source"])) {
          mappedRecord.source = fields["Source"]
        }
        if (fields["Product Inquiry"] && Array.isArray(fields["Product Inquiry"])) {
          mappedRecord.product_inquiry = fields["Product Inquiry"]
        }
        if (fields["Tags"] && Array.isArray(fields["Tags"])) {
          mappedRecord.tags = fields["Tags"]
        }
      }

      if (tableName === "Products") {
        if (fields["Variants"] && Array.isArray(fields["Variants"])) {
          mappedRecord.variants = fields["Variants"]
        }
      }

      if (record.createdTime && !mappedRecord.created_at) {
        mappedRecord.created_at = parseDate(record.createdTime)
      }

      if (Object.keys(mappedRecord).length > 0) {
        recordsToInsert.push(mappedRecord)
      }
    }

    if (recordsToInsert.length === 0) {
      return ""
    }

    // Generate INSERT SQL
    const columns = Object.keys(recordsToInsert[0])
    const values = recordsToInsert.map(record =>
      `(${columns.map(col => escapeSQLString(record[col])).join(", ")})`
    ).join(",\n  ")

    return `INSERT INTO ${supabaseTable} (${columns.join(", ")})
VALUES
  ${values}
ON CONFLICT DO NOTHING;`

  } catch (error: any) {
    console.error(`Error processing ${tableName}:`, error.message)
    return ""
  }
}

async function main() {
  console.log("🚀 Generating SQL for Airtable to Supabase Sync...\n")

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

  const allSQL: string[] = []

  for (const { airtable, supabase } of dependencyOrder) {
    console.log(`📊 Processing ${airtable} -> ${supabase}`)
    const sql = await generateInsertSQL(airtable, supabase)
    if (sql) {
      allSQL.push(`-- ${airtable} -> ${supabase}`)
      allSQL.push(sql)
      allSQL.push("")
      console.log(`   ✅ Generated SQL`)
    } else {
      console.log(`   ⏭️  No data to sync`)
    }
  }

  console.log("\n✅ SQL generation complete!")
  console.log("\nTo execute this migration, use:")
  console.log("mcp_supabase_apply_migration with the combined SQL")
  
  return allSQL.join("\n\n")
}

main().then(sql => {
  console.log("\n" + "=".repeat(60))
  console.log("Generated SQL (first 2000 chars):")
  console.log("=".repeat(60))
  console.log(sql.substring(0, 2000))
  if (sql.length > 2000) {
    console.log("\n... (truncated)")
  }
}).catch(console.error)

