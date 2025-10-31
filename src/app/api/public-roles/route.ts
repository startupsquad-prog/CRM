import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// GET /api/public-roles - Get available roles for quick login (public endpoint)
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data: roles, error } = await supabase
      .from('roles')
      .select('name, display_name, description, level')
      .eq('is_system_role', true)
      .order('level', { ascending: false })

    if (error) {
      console.error('Error fetching roles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch roles' },
        { status: 500 }
      )
    }

    return NextResponse.json({ roles })
  } catch (error: any) {
    console.error('Error in GET /api/public-roles:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

