import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/clerk-auth'

// GET /api/users - Get all users with filters
export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()
    
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const role = searchParams.get('role')
    const groupId = searchParams.get('groupId')
    const isActive = searchParams.get('isActive')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    let query = supabase
      .from('users')
      .select(`
        *,
        department:departments(id, name),
        user_roles(
          role:roles(id, name, display_name, is_primary)
        ),
        user_groups(
          group:groups(id, name, color, is_primary)
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (role) {
      query = query.eq('role', role)
    }

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Filter by group if specified
    let filteredUsers = users || []
    if (groupId && users) {
      filteredUsers = users.filter((user: any) =>
        user.user_groups?.some((ug: any) => ug.group.id === groupId)
      )
    }

    // Get total count
    let countQuery = supabase.from('users').select('*', { count: 'exact', head: true })
    if (search) {
      countQuery = countQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }
    if (role) {
      countQuery = countQuery.eq('role', role)
    }
    if (isActive !== null) {
      countQuery = countQuery.eq('is_active', isActive === 'true')
    }

    const { count: totalCount } = await countQuery

    return NextResponse.json({
      users: filteredUsers,
      pagination: {
        page,
        limit,
        total: groupId ? filteredUsers.length : (totalCount || 0),
        totalPages: Math.ceil((groupId ? filteredUsers.length : (totalCount || 0)) / limit),
      },
    })
  } catch (error: any) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
    
    const body = await request.json()
    const { email, full_name, phone, department_id, role, groups, roles } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Note: In production, you would create the user in Clerk first,
    // then sync to Supabase. For now, we'll create a placeholder.
    // The actual user creation should be done through Clerk API.
    
    return NextResponse.json(
      { error: 'User creation must be done through Clerk. Use /api/users/invite to send an invitation.' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error('Error in POST /api/users:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
