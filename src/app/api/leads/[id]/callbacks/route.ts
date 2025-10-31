import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/leads/[id]/callbacks - Get all callbacks for a lead
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
      .from('lead_callbacks')
      .select('*')
      .eq('lead_id', leadId)
      .order('callback_date', { ascending: false })

    if (error) {
      console.error('Error fetching callbacks:', error)
      return NextResponse.json({ error: 'Failed to fetch callbacks' }, { status: 500 })
    }

    return NextResponse.json({ callbacks: data || [] })
  } catch (error) {
    console.error('Error in GET /api/leads/[id]/callbacks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/leads/[id]/callbacks - Create a new callback
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
    const { callback_date, notes, priority = 'medium', status = 'scheduled' } = body

    if (!callback_date) {
      return NextResponse.json({ error: 'Callback date is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('lead_callbacks')
      .insert({
        lead_id: leadId,
        callback_date: new Date(callback_date).toISOString(),
        notes: notes || null,
        priority,
        status,
        created_by: userId,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating callback:', error)
      return NextResponse.json({ error: 'Failed to create callback' }, { status: 500 })
    }

    return NextResponse.json({ callback: data })
  } catch (error) {
    console.error('Error in POST /api/leads/[id]/callbacks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/leads/[id]/callbacks/[callbackId] - Update a callback
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await Promise.resolve(params)
    const body = await request.json()
    const { callback_id, ...updates } = body

    if (!callback_id) {
      return NextResponse.json({ error: 'Callback ID is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Prepare update object
    const updateData: any = {}
    if (updates.callback_date) updateData.callback_date = new Date(updates.callback_date).toISOString()
    if (updates.notes !== undefined) updateData.notes = updates.notes
    if (updates.priority) updateData.priority = updates.priority
    if (updates.status) updateData.status = updates.status
    if (updates.status === 'completed') updateData.completed_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('lead_callbacks')
      .update(updateData)
      .eq('id', callback_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating callback:', error)
      return NextResponse.json({ error: 'Failed to update callback' }, { status: 500 })
    }

    return NextResponse.json({ callback: data })
  } catch (error) {
    console.error('Error in PATCH /api/leads/[id]/callbacks:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

