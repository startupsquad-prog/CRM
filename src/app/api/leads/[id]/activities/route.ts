import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/leads/[id]/activities - Get all activities for a lead
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

    // Get all activities for the lead, ordered by most recent
    const { data, error } = await supabase
      .from('lead_activities')
      .select(`
        *,
        note:lead_notes(*),
        call:lead_calls(*),
        email:lead_emails(*),
        callback:lead_callbacks(*)
      `)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching activities:', error)
      return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 })
    }

    return NextResponse.json({ activities: data || [] })
  } catch (error) {
    console.error('Error in GET /api/leads/[id]/activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/leads/[id]/activities - Create a new activity
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
    const { activity_type, description, metadata } = body

    if (!activity_type) {
      return NextResponse.json({ error: 'Activity type is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('lead_activities')
      .insert({
        lead_id: leadId,
        activity_type,
        created_by: userId,
        description: description || '',
        metadata: metadata || {},
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating activity:', error)
      return NextResponse.json({ error: 'Failed to create activity' }, { status: 500 })
    }

    return NextResponse.json({ activity: data })
  } catch (error) {
    console.error('Error in POST /api/leads/[id]/activities:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

