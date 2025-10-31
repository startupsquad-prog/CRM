import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    // Authenticate with Clerk
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get Supabase client
    const supabase = createServerSupabaseClient()

    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const stage = searchParams.get('stage')
    const search = searchParams.get('search')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    // Build query
    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    // Filter by stage
    if (stage && stage !== 'all') {
      query = query.eq('stage', stage)
    }

    // Filter by date range
    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }
    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    // Execute query
    const { data, error } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    // Filter by search query (client-side for text search simplicity)
    let filteredData = data || []
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredData = filteredData.filter((lead: any) =>
        lead.full_name?.toLowerCase().includes(searchLower) ||
        lead.email?.toLowerCase().includes(searchLower) ||
        lead.phone?.toLowerCase().includes(searchLower) ||
        lead.lead_id?.toLowerCase().includes(searchLower)
      )
    }

    // Transform data to match Lead type
    const transformedLeads = filteredData.map((lead: any) => ({
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
    }))

    return NextResponse.json({ leads: transformedLeads })
  } catch (error) {
    console.error('Error in GET /api/leads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

