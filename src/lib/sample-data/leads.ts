import { createAvatar } from '@dicebear/core'
import { micah } from '@dicebear/collection'
import { Lead, LeadSource, LeadStage } from '@/types/lead'

const firstNames = [
  'Raj', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rahul', 'Kavita',
  'Arjun', 'Meera', 'Suresh', 'Divya', 'Nikhil', 'Pooja', 'Rohit', 'Sunita',
  'Aditya', 'Neha', 'Karan', 'Shruti', 'Manish', 'Radha', 'Siddharth', 'Deepika'
]

const lastNames = [
  'Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Mehta', 'Reddy', 'Joshi',
  'Iyer', 'Nair', 'Malhotra', 'Agarwal', 'Shah', 'Verma', 'Chopra', 'Kapoor'
]

const emailDomains = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'company.com'
]

const sources: LeadSource[] = [
  'website',
  'inbound-call',
  'referral',
  'email',
  'social',
  'trade-show',
  'other'
]

const productInquiries = [
  'Premium Massager Chair ( Trending🔥)',
  '3d Printer',
  'Action Figurines'
]

const tags = [
  'Hot Lead', 'Warm Lead', 'Cold Lead', 'Follow-up Required',
  'Price Sensitive', 'Bulk Order', 'Corporate', 'Retail'
]

const stages: LeadStage[] = [
  'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'
]

function generatePhoneNumber(): string {
  // Generate Indian mobile number (10 digits starting with 6-9)
  const prefix = Math.floor(Math.random() * 4) + 6 // 6-9
  const remaining = Math.floor(Math.random() * 900000000) + 100000000
  return `+91${prefix}${remaining}`
}

function generateEmail(firstName: string, lastName: string): string {
  const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)]
  const num = Math.random() > 0.5 ? Math.floor(Math.random() * 1000) : ''
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${num}@${domain}`
}

function generateDicebearAvatar(seed: string): string {
  try {
    const avatar = createAvatar(micah, {
      seed: seed,
      size: 128,
    })
    return avatar.toDataUri()
  } catch {
    // Fallback to API if library fails
    return `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(seed)}`
  }
}

export function generateSampleLeads(count: number): Lead[] {
  const leads: Lead[] = []
  const now = new Date()
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const fullName = `${firstName} ${lastName}`
    const email = generateEmail(firstName, lastName)
    const phone = generatePhoneNumber()
    
    // Generate random date within last 90 days
    const daysAgo = Math.floor(Math.random() * 90)
    const createdDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    // Random number of sources (1-3)
    const numSources = Math.floor(Math.random() * 3) + 1
    const selectedSources: LeadSource[] = []
    for (let j = 0; j < numSources; j++) {
      const source = sources[Math.floor(Math.random() * sources.length)]
      if (!selectedSources.includes(source)) {
        selectedSources.push(source)
      }
    }
    
    // Random product inquiries (1-2)
    const numProducts = Math.floor(Math.random() * 2) + 1
    const selectedProducts: string[] = []
    for (let j = 0; j < numProducts; j++) {
      const product = productInquiries[Math.floor(Math.random() * productInquiries.length)]
      if (!selectedProducts.includes(product)) {
        selectedProducts.push(product)
      }
    }
    
    // Random tags (0-3)
    const numTags = Math.floor(Math.random() * 4)
    const selectedTags: string[] = []
    for (let j = 0; j < numTags; j++) {
      const tag = tags[Math.floor(Math.random() * tags.length)]
      if (!selectedTags.includes(tag)) {
        selectedTags.push(tag)
      }
    }
    
    const leadId = `LD-${String(i + 1).padStart(4, '0')}`
    const leadAgeDays = daysAgo
    
    // Generate WhatsApp link
    const phoneDigits = phone.replace(/\D/g, '')
    const whatsapp = phoneDigits ? `https://wa.me/${phoneDigits}` : null
    const whatsappNumber = phoneDigits ? phoneDigits.slice(-10) : null
    
    // Generate avatar using full name as seed
    const avatarUrl = generateDicebearAvatar(`${fullName}-${i}`)
    
    // Assign random stage
    const stage = stages[Math.floor(Math.random() * stages.length)]
    
    const lead: Lead = {
      id: `lead-${i + 1}`,
      lead_id: leadId,
      full_name: fullName,
      email: email,
      phone: phone,
      whatsapp: whatsapp,
      whatsapp_number: whatsappNumber,
      source: selectedSources.length > 0 ? selectedSources : ['website'],
      product_inquiry: selectedProducts.length > 0 ? selectedProducts : [productInquiries[0]],
      quantity: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 1 : null,
      tags: selectedTags,
      notes: Math.random() > 0.6 ? `Notes for ${fullName}: Interested in ${selectedProducts.join(', ')}` : null,
      messages: null,
      product_id: null,
      assigned_to: Math.random() > 0.3 ? `user-${Math.floor(Math.random() * 5) + 1}` : null,
      quotation_ids: [],
      client_id: null,
      created_at: createdDate,
      created_on: createdDate,
      lead_age_days: leadAgeDays,
      latest_quotation_date: Math.random() > 0.7 ? new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
      product_image_url: null,
      welcome_message_status: Math.random() > 0.5 ? 'sent' : 'not_sent',
      avatar_url: avatarUrl,
      stage: stage,
    }
    
    leads.push(lead)
  }
  
  return leads
}

