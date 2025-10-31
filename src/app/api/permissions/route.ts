import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/clerk-auth'

// GET /api/permissions - Get all permissions
export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()
    
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const resource = searchParams.get('resource')
    const category = searchParams.get('category')

    let query = supabase
      .from('permissions')
      .select('*')
      .order('category', { ascending: true })
      .order('resource', { ascending: true })
      .order('action', { ascending: true })

    if (resource) {
      query = query.eq('resource', resource)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data: permissions, error } = await query

    if (error) {
      console.error('Error fetching permissions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch permissions' },
        { status: 500 }
      )
    }

    // Group permissions by resource and category
    const grouped = (permissions || []).reduce((acc: any, perm: any) => {
      if (!acc[perm.category]) {
        acc[perm.category] = {}
      }
      if (!acc[perm.category][perm.resource]) {
        acc[perm.category][perm.resource] = []
      }
      acc[perm.category][perm.resource].push(perm)
      return acc
    }, {})

    return NextResponse.json({
      permissions: permissions || [],
      grouped,
    })
  } catch (error: any) {
    console.error('Error in GET /api/permissions:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
