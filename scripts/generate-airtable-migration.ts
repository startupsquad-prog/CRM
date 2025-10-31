/**
 * Generate SQL migration from Airtable JSON data
 */

import { readFileSync } from "fs"
import { resolve } from "path"

function escapeSQL(str: any): string {
  if (str === null || str === undefined) return "NULL"
  if (typeof str === "boolean") return str ? "TRUE" : "FALSE"
  if (typeof str === "number") return String(str)
  if (Array.isArray(str)) {
    const escaped = str.map(s => `"${String(s).replace(/"/g, '\\"')}"`).join(", ")
    return `'{${escaped}}'::text[]`
  }
  // Handle strings - escape single quotes, backslashes, and newlines
  const strValue = String(str)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
  return `'${strValue}'`
}

function parseDate(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    // Return as DATE format (YYYY-MM-DD)
    return date.toISOString().split('T')[0]
  } catch {
    return null
  }
}

function normalizeStage(stage: string): string {
  if (!stage) return "new"
  const s = stage.toLowerCase()
  if (s.includes("new")) return "new"
  if (s.includes("contacted")) return "contacted"
  if (s.includes("qualified")) return "qualified"
  if (s.includes("proposal")) return "proposal"
  if (s.includes("negotiation")) return "negotiation"
  if (s.includes("won")) return "won"
  if (s.includes("lost")) return "lost"
  return "new"
}

function normalizeStatus(status: string): string {
  if (!status) return "draft"
  const s = status.toLowerCase()
  if (s.includes("sent")) return "sent"
  if (s.includes("accepted")) return "accepted"
  if (s.includes("rejected")) return "rejected"
  if (s.includes("expired")) return "expired"
  return "draft"
}

// Process Leads
function generateLeadsSQL(): string {
  const filePath = resolve(process.cwd(), "data", "airtable", "Leads.json")
  const data = JSON.parse(readFileSync(filePath, "utf-8"))
  
  const values: string[] = []
  
  for (const record of data.records) {
    const fields = record.fields
    const leadId = escapeSQL(fields["Lead ID"] || null)
    const fullName = escapeSQL(fields["Full Name"] || "")
    const email = escapeSQL(fields["Email Address"] || null)
    const phone = escapeSQL(fields["Phone Number"] || null)
    const whatsapp = escapeSQL(fields["WhatsApp"] || null)
    const whatsappNumber = escapeSQL(fields["Whatsapp Number"] || null)
    const source = fields["Source"] && Array.isArray(fields["Source"]) 
      ? escapeSQL(fields["Source"]) 
      : "NULL"
    const stage = escapeSQL(normalizeStage(fields["Stage"] || "new"))
    const productInquiry = fields["Product Inquiry"] && Array.isArray(fields["Product Inquiry"])
      ? escapeSQL(fields["Product Inquiry"])
      : "NULL"
    const quantity = fields["Quantity (Approx.)"] ? escapeSQL(fields["Quantity (Approx.)"]) : "NULL"
    const leadAgeDays = fields["Lead Age (Days)"] ? escapeSQL(fields["Lead Age (Days)"]) : "NULL"
    const welcomeStatus = escapeSQL(fields["Welcome Message Status "] === "Sent " ? "sent" : "not_sent")
    const createdOn = escapeSQL(parseDate(fields["Created On"] || record.createdTime))
    const created = escapeSQL(parseDate(fields["Created"] || record.createdTime))
    
    values.push(`(${leadId}, ${fullName}, ${email}, ${phone}, ${whatsapp}, ${whatsappNumber}, ${source}, ${productInquiry}, ${quantity}, ${stage}, ${leadAgeDays}, ${welcomeStatus}, ${createdOn}, ${created})`)
  }
  
  return `INSERT INTO leads (lead_id, full_name, email, phone, whatsapp, whatsapp_number, source, product_inquiry, quantity, stage, lead_age_days, welcome_message_status, created_on, created_at)
VALUES
${values.join(",\n")}
ON CONFLICT (lead_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  whatsapp = EXCLUDED.whatsapp,
  whatsapp_number = EXCLUDED.whatsapp_number,
  source = EXCLUDED.source,
  product_inquiry = EXCLUDED.product_inquiry,
  quantity = EXCLUDED.quantity,
  stage = EXCLUDED.stage,
  lead_age_days = EXCLUDED.lead_age_days,
  welcome_message_status = EXCLUDED.welcome_message_status,
  created_on = EXCLUDED.created_on,
  updated_at = now();`
}

// Process Clients
function generateClientsSQL(): string {
  const filePath = resolve(process.cwd(), "data", "airtable", "Clients.json")
  const data = JSON.parse(readFileSync(filePath, "utf-8"))
  
  const values: string[] = []
  
  for (const record of data.records) {
    const fields = record.fields
    const clientId = escapeSQL(fields["Client ID"] || null)
    const name = escapeSQL(fields["Client Name"] || "")
    const contactDetails = escapeSQL(fields["Contact Details"] || null)
    const city = escapeSQL(fields["City"] || null)
    const state = escapeSQL(null) // Not in Airtable data
    const country = escapeSQL("India")
    const clientType = escapeSQL(fields["Client Type"] || null)
    const gstNumber = escapeSQL(fields["GST Number"] || null)
    const shippingAddress = escapeSQL(fields["Shipping Address"] || null)
    const totalOrderValue = escapeSQL(fields["Total Order Value"] || 0)
    const numberOfLeads = escapeSQL(fields["Number of Leads"] || 0)
    const numberOfQuotations = escapeSQL(fields["Number of Quotations"] || 0)
    const numberOfOrders = escapeSQL(fields["Number of Orders"] || 0)
    
    values.push(`(${clientId}, ${name}, ${contactDetails}, ${city}, ${state}, ${country}, ${clientType}, ${gstNumber}, ${shippingAddress}, ${totalOrderValue}, ${numberOfLeads}, ${numberOfQuotations}, ${numberOfOrders})`)
  }
  
  return `INSERT INTO clients (client_id, name, contact_details, city, state, country, client_type, gst_number, shipping_address, total_order_value, number_of_leads, number_of_quotations, number_of_orders)
VALUES
${values.join(",\n")}
ON CONFLICT (client_id) DO UPDATE SET
  name = EXCLUDED.name,
  contact_details = EXCLUDED.contact_details,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  country = EXCLUDED.country,
  client_type = EXCLUDED.client_type,
  gst_number = EXCLUDED.gst_number,
  shipping_address = EXCLUDED.shipping_address,
  total_order_value = EXCLUDED.total_order_value,
  number_of_leads = EXCLUDED.number_of_leads,
  number_of_quotations = EXCLUDED.number_of_quotations,
  number_of_orders = EXCLUDED.number_of_orders,
  updated_at = now();`
}

// Process Products
function generateProductsSQL(): string {
  const filePath = resolve(process.cwd(), "data", "airtable", "Products.json")
  const data = JSON.parse(readFileSync(filePath, "utf-8"))
  
  const values: string[] = []
  
  for (const record of data.records) {
    const fields = record.fields
    const sku = escapeSQL(fields["SKU/Model No."] || "")
    const name = escapeSQL(fields["Product Name"] || "")
    const category = escapeSQL(fields["Category"] || null)
    const subCategory = escapeSQL(fields["Sub Category"] || null)
    const currentMarketPrice = escapeSQL(fields["Current Market Price (India)"] || null)
    const minOrderQty = escapeSQL(fields["Minimum Order Quantity"] || 1)
    const productSummary = escapeSQL(fields["Product Summary (AI)"]?.value || null)
    const marketPriceResearch = escapeSQL(fields["Market Price Research (AI)"]?.value || null)
    const alibabaUrl = escapeSQL(fields["Alibaba URL"] || null)
    const listingUrl = escapeSQL(fields["Listing URL"] || null)
    const leadCount = escapeSQL(fields["# of Leads"] || 0)
    const quotationCount = escapeSQL(fields["# of Quotations"] || 0)
    const orderCount = escapeSQL(fields["# of Orders"] || 0)
    const variants = fields["Variants"] && Array.isArray(fields["Variants"])
      ? escapeSQL(fields["Variants"])
      : "NULL"
    
    values.push(`(${sku}, ${name}, ${category}, ${subCategory}, ${currentMarketPrice}, ${minOrderQty}, ${productSummary}, ${marketPriceResearch}, ${alibabaUrl}, ${listingUrl}, ${leadCount}, ${quotationCount}, ${orderCount}, ${variants})`)
  }
  
  return `INSERT INTO products (sku, name, category, sub_category, current_market_price, minimum_order_quantity, product_summary, market_price_research, alibaba_url, listing_url, lead_count, quotation_count, order_count, variants)
VALUES
${values.join(",\n")}
ON CONFLICT (sku) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  sub_category = EXCLUDED.sub_category,
  current_market_price = EXCLUDED.current_market_price,
  minimum_order_quantity = EXCLUDED.minimum_order_quantity,
  product_summary = EXCLUDED.product_summary,
  market_price_research = EXCLUDED.market_price_research,
  alibaba_url = EXCLUDED.alibaba_url,
  listing_url = EXCLUDED.listing_url,
  lead_count = EXCLUDED.lead_count,
  quotation_count = EXCLUDED.quotation_count,
  order_count = EXCLUDED.order_count,
  variants = EXCLUDED.variants,
  updated_at = now();`
}

// Process Quotations
function generateQuotationsSQL(): string {
  const filePath = resolve(process.cwd(), "data", "airtable", "Quotations.json")
  const data = JSON.parse(readFileSync(filePath, "utf-8"))
  
  // Use Map to ensure unique quotations by Quotation ID
  const uniqueQuotations = new Map<string, any>()
  
  for (const record of data.records) {
    const quotationId = record.fields["Quotation ID"]
    if (quotationId && !uniqueQuotations.has(quotationId)) {
      uniqueQuotations.set(quotationId, record)
    }
  }
  
  const values: string[] = []
  
  for (const record of Array.from(uniqueQuotations.values())) {
    const fields = record.fields
    const quotationId = escapeSQL(fields["Quotation ID"] || null)
    const quoteNumber = escapeSQL(fields["Quotation ID"] || "") // Use Quotation ID as quote_number
    const totalAmount = escapeSQL(fields["Total Cost"] || 0)
    const currency = escapeSQL("INR")
    const status = escapeSQL(normalizeStatus(fields["Status"] || "draft"))
    const quotationDate = escapeSQL(parseDate(fields["Quotation Date"] || null))
    const expiryDate = escapeSQL(parseDate(fields["Expiry Date"] || null))
    const daysUntilExpiry = escapeSQL(fields["Days Until Expiry"] || null)
    const isExpired = escapeSQL(fields["Is Expired?"] === "Yes")
    const gst = escapeSQL(fields["GST"] || 0)
    const quotationSummary = escapeSQL(fields["Quotation Summary (AI)"]?.value || null)
    const dealWinProbability = escapeSQL(fields["Deal Win Probability (AI)"]?.value || null)
    const notes = escapeSQL(fields["Notes"] || null)
    
    // We need lead_id and created_by - these would need to be resolved
    // For now, we'll set them as NULL and they can be updated later
    const leadId = "NULL"
    const createdBy = "NULL" // Will be nullable after migration
    
    values.push(`(${quotationId}, ${quoteNumber}, ${leadId}, ${totalAmount}, ${currency}, ${status}, ${quotationDate}, ${expiryDate}, ${daysUntilExpiry}, ${isExpired}, ${gst}, ${quotationSummary}, ${dealWinProbability}, ${createdBy}, ${notes})`)
  }
  
  return `INSERT INTO quotations (quotation_id, quote_number, lead_id, total_amount, currency, status, quotation_date, expiry_date, days_until_expiry, is_expired, gst, quotation_summary, deal_win_probability, created_by, notes)
VALUES
${values.join(",\n")}
ON CONFLICT (quote_number) DO UPDATE SET
  quotation_id = EXCLUDED.quotation_id,
  total_amount = EXCLUDED.total_amount,
  currency = EXCLUDED.currency,
  status = EXCLUDED.status,
  quotation_date = EXCLUDED.quotation_date,
  expiry_date = EXCLUDED.expiry_date,
  days_until_expiry = EXCLUDED.days_until_expiry,
  is_expired = EXCLUDED.is_expired,
  gst = EXCLUDED.gst,
  quotation_summary = EXCLUDED.quotation_summary,
  deal_win_probability = EXCLUDED.deal_win_probability,
  notes = EXCLUDED.notes,
  updated_at = now();`
}

// Generate combined migration
const migrationSQL = `
-- Airtable Data Migration
-- Generated from Airtable JSON files

-- First, insert Products (no dependencies)
${generateProductsSQL()};

-- Insert Clients (no dependencies)
${generateClientsSQL()};

-- Insert Leads (may reference products, but we'll allow NULL for now)
${generateLeadsSQL()};

-- Insert Quotations (may reference leads/clients, but we'll allow NULL for now)
${generateQuotationsSQL()};
`

console.log(migrationSQL)

