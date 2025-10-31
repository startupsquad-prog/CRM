import { createAvatar } from '@dicebear/core'
import { micah } from '@dicebear/collection'

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

const sources = ['website', 'inbound-call', 'referral', 'email', 'social', 'trade-show', 'other']

const productInquiries = [
  'Premium Massager Chair ( Trending🔥)',
  '3d Printer',
  'Action Figurines'
]

const tags = [
  'Hot Lead', 'Warm Lead', 'Cold Lead', 'Follow-up Required',
  'Price Sensitive', 'Bulk Order', 'Corporate', 'Retail'
]

const stages = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']

function generatePhoneNumber(): string {
  const prefix = Math.floor(Math.random() * 4) + 6
  const remaining = Math.floor(Math.random() * 900000000) + 100000000
  return `+91${prefix}${remaining}`
}

function generateEmail(firstName: string, lastName: string): string {
  const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)]
  const num = Math.random() > 0.5 ? Math.floor(Math.random() * 1000) : ''
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}${num}@${domain}`
}

function generateDicebearAvatar(seed: string): string {
  return `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(seed)}`
}

const now = new Date()
const values: string[] = []

for (let i = 0; i < 50; i++) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const fullName = `${firstName} ${lastName}`
  const email = generateEmail(firstName, lastName)
  const phone = generatePhoneNumber()
  
  const daysAgo = Math.floor(Math.random() * 90)
  const createdDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
  
  const numSources = Math.floor(Math.random() * 3) + 1
  const selectedSources: string[] = []
  for (let j = 0; j < numSources; j++) {
    const source = sources[Math.floor(Math.random() * sources.length)]
    if (!selectedSources.includes(source)) {
      selectedSources.push(source)
    }
  }
  
  const numProducts = Math.floor(Math.random() * 2) + 1
  const selectedProducts: string[] = []
  for (let j = 0; j < numProducts; j++) {
    const product = productInquiries[Math.floor(Math.random() * productInquiries.length)]
    if (!selectedProducts.includes(product)) {
      selectedProducts.push(product)
    }
  }
  
  const numTags = Math.floor(Math.random() * 4)
  const selectedTags: string[] = []
  for (let j = 0; j < numTags; j++) {
    const tag = tags[Math.floor(Math.random() * tags.length)]
    if (!selectedTags.includes(tag)) {
      selectedTags.push(tag)
    }
  }
  
  const leadId = `LD-${String(i + 1).padStart(4, '0')}`
  const phoneDigits = phone.replace(/\D/g, '')
  const whatsapp = phoneDigits ? `https://wa.me/${phoneDigits}` : null
  const whatsappNumber = phoneDigits ? phoneDigits.slice(-10) : null
  const stage = stages[Math.floor(Math.random() * stages.length)]
  const avatarUrl = generateDicebearAvatar(`${fullName}-${i}`)
  const welcomeMessageStatus = Math.random() > 0.5 ? 'sent' : 'not_sent'
  const quantity = Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 1 : null
  const notes = Math.random() > 0.6 ? `Notes for ${fullName}: Interested in ${selectedProducts.join(', ')}` : null
  
  const sourceArr = `{${selectedSources.length > 0 ? selectedSources.map(s => `"${s}"`).join(',') : '"website"'}}`
  const productArr = `{${selectedProducts.length > 0 ? selectedProducts.map(p => `"${p.replace(/"/g, '\\"')}"`).join(',') : `"${productInquiries[0].replace(/"/g, '\\"')}"`}}`
  const tagsArr = `{${selectedTags.map(t => `"${t}"`).join(',')}}`
  
  const createdDateISO = createdDate.toISOString()
  
  const escapedFullName = fullName.replace(/'/g, "''")
  const escapedEmail = email.replace(/'/g, "''")
  const escapedNotes = notes ? notes.replace(/'/g, "''") : null
  
  values.push(
    `('${leadId}', '${escapedFullName}', '${escapedEmail}', '${phone}', ${whatsapp ? `'${whatsapp}'` : 'NULL'}, ${whatsappNumber ? `'${whatsappNumber}'` : 'NULL'}, '${sourceArr}'::text[], '${productArr}'::text[], ${quantity ? quantity : 'NULL'}, '${tagsArr}'::text[], ${escapedNotes ? `'${escapedNotes}'` : 'NULL'}, '${createdDateISO}', '${createdDateISO}', ${daysAgo}, '${welcomeMessageStatus}', '${avatarUrl}', '${stage}')`
  )
}

const sql = `INSERT INTO leads (lead_id, full_name, email, phone, whatsapp, whatsapp_number, source, product_inquiry, quantity, tags, notes, created_at, created_on, lead_age_days, welcome_message_status, avatar_url, stage) VALUES\n${values.join(',\n')};`

console.log(sql)

