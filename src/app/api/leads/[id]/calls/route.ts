import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/leads/[id]/calls - Get all calls for a lead
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

    const { data, error } = await supabase
      .from('lead_calls')
      .select('*')
      .eq('lead_id', leadId)
      .order('call_date', { ascending: false })

    if (error) {
      console.error('Error fetching calls:', error)
      return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 })
    }

    return NextResponse.json({ calls: data || [] })
  } catch (error) {
    console.error('Error in GET /api/leads/[id]/calls:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/leads/[id]/calls - Log a new call
export async function POST(
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

    const body = await request.json()
    const { 
      call_type, 
      direction, 
      duration_seconds = 0, 
      phone_number, 
      outcome, 
      notes,
      call_date,
      metadata = {}
    } = body

    if (!call_type || !direction) {
      return NextResponse.json({ error: 'Call type and direction are required' }, { status: 400 })
    }

    if (!['inbound', 'outbound', 'missed'].includes(call_type)) {
      return NextResponse.json({ error: 'Invalid call type' }, { status: 400 })
    }

    if (!['incoming', 'outgoing'].includes(direction)) {
      return NextResponse.json({ error: 'Invalid direction' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('lead_calls')
      .insert({
        lead_id: leadId,
        call_type,
        direction,
        duration_seconds: Number(duration_seconds) || 0,
        phone_number: phone_number || null,
        outcome: outcome || null,
        notes: notes || null,
        call_date: call_date ? new Date(call_date).toISOString() : new Date().toISOString(),
        metadata,
        created_by: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating call:', error)
      return NextResponse.json({ error: 'Failed to log call' }, { status: 500 })
    }

    return NextResponse.json({ call: data })
  } catch (error) {
    console.error('Error in POST /api/leads/[id]/calls:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

