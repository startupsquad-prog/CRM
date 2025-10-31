import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching departments:', error)
      return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 })
    }

    return NextResponse.json({ departments: data || [] })
  } catch (error) {
    console.error('Error in GET /api/departments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

