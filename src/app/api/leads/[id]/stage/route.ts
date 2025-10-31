import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { LeadStage } from '@/types/lead'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Authenticate with Clerk
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = await Promise.resolve(params)
    const leadId = resolvedParams.id

    // Get the lead ID and new stage from request body
    const body = await request.json()
    const { stage } = body

    if (!stage || !['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].includes(stage)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 })
    }

    // Get Supabase client
    const supabase = createServerSupabaseClient()

    // Update lead stage
    const { data, error } = await supabase
      .from('leads')
      .update({ stage: stage as LeadStage })
      .eq('id', leadId)
      .select()
      .single()

    if (error) {
      console.error('Error updating lead stage:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to update lead stage',
        details: error.code 
      }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PATCH /api/leads/[id]/stage:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

