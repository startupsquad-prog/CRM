import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

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

    // Get the rating from request body
    const body = await request.json()
    const { rating } = body

    // Validate rating: must be 1-5 or null
    if (rating !== null && (rating < 1 || rating > 5 || !Number.isInteger(rating))) {
      return NextResponse.json({ error: 'Invalid rating. Must be 1-5 or null' }, { status: 400 })
    }

    // Get Supabase client
    const supabase = createServerSupabaseClient()

    // Update lead rating
    const { data, error } = await supabase
      .from('leads')
      .update({ rating })
      .eq('id', leadId)
      .select()
      .single()

    if (error) {
      console.error('Error updating lead rating:', error)
      return NextResponse.json({ 
        error: error.message || 'Failed to update lead rating',
        details: error.code 
      }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PATCH /api/leads/[id]/rating:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

