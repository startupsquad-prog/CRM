export type LeadSource = 
  | 'website'
  | 'inbound-call'
  | 'referral'
  | 'email'
  | 'social'
  | 'trade-show'
  | 'whatsapp'
  | 'other'

export type LeadStage = 
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost'

export type LeadScore = 'A' | 'B' | 'C'
export type LeadType = 'Personal' | 'Reseller' | 'Interior Designer' | 'Other'
export type WelcomeMessageStatus = 'sent' | 'not_sent'

export interface Lead {
  id: string // UUID
  lead_id: string // LD-XXXX format, auto-generated
  full_name: string
  email: string | null
  phone: string | null
  whatsapp: string | null // Derived from phone
  whatsapp_number: string | null // 10-digit formatted
  source: LeadSource[]
  product_inquiry: string[]
  quantity: number | null
  tags: string[]
  notes: string | null
  messages: string | null
  product_id: string | null // Linked to products
  assigned_to: string | null // Linked to users/team
  quotation_ids: string[] // Linked to quotations
  client_id: string | null // Linked to clients
  created_at: Date
  created_on: Date // Alias for created_at
  lead_age_days: number // Calculated
  latest_quotation_date: Date | null
  product_image_url: string | null // Looked up from product
  welcome_message_status: WelcomeMessageStatus
  avatar_url: string // Dicebear micah
  stage: LeadStage // Workflow stage for kanban
  // OLLDeals-specific fields
  lead_score: LeadScore | null // A = Lakshay handles, B = Sales, C = Auto nurture
  budget: number | null // Budget in INR
  city: string | null // Client city
  lead_type: LeadType | null // Personal, Reseller, Interior Designer, Other
  rating: number | null // Star rating 1-5
}

// Helper type for creating new leads (without auto-generated fields)
export type CreateLeadInput = Omit<
  Lead,
  | 'id'
  | 'lead_id'
  | 'whatsapp'
  | 'whatsapp_number'
  | 'created_at'
  | 'created_on'
  | 'lead_age_days'
  | 'latest_quotation_date'
  | 'avatar_url'
> & {
  created_at?: Date
}

// Helper type for updating leads
export type UpdateLeadInput = Partial<CreateLeadInput>

