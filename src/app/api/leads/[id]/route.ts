import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/leads/[id] - Get a single lead by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const leadId = resolvedParams.id

    const supabase = createServerSupabaseClient()

    // Get the lead
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (error) {
      console.error('Error fetching lead:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }
      return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
    }

    // Transform data to match Lead type
    const transformedLead = {
      id: lead.id,
      lead_id: lead.lead_id || '',
      full_name: lead.full_name,
      email: lead.email,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      whatsapp_number: lead.whatsapp_number,
      source: lead.source || [],
      product_inquiry: lead.product_inquiry || [],
      quantity: lead.quantity,
      tags: lead.tags || [],
      notes: lead.notes,
      messages: lead.messages,
      product_id: lead.product_id,
      assigned_to: lead.assigned_to,
      quotation_ids: lead.quotation_ids || [],
      client_id: lead.client_id,
      created_at: new Date(lead.created_at),
      created_on: new Date(lead.created_on || lead.created_at),
      lead_age_days: lead.lead_age_days || 0,
      latest_quotation_date: lead.latest_quotation_date ? new Date(lead.latest_quotation_date) : null,
      product_image_url: lead.product_image_url,
      welcome_message_status: lead.welcome_message_status || 'not_sent',
      avatar_url: lead.avatar_url || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(lead.full_name)}`,
      stage: lead.stage || 'new',
      lead_score: lead.lead_score || null,
      budget: lead.budget || null,
      city: lead.city || null,
      lead_type: lead.lead_type || null,
      rating: lead.rating || null,
    }

    return NextResponse.json({ lead: transformedLead })
  } catch (error) {
    console.error('Error in GET /api/leads/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

