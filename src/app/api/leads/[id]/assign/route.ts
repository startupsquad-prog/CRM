import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { assigned_to } = body

    const supabase = createServerSupabaseClient()

    // Update lead assignment
    const { data, error } = await supabase
      .from('leads')
      .update({ assigned_to })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lead assignment:', error)
      return NextResponse.json({ error: 'Failed to update assignment' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PATCH /api/leads/[id]/assign:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

