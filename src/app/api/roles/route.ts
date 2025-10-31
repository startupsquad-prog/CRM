import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/clerk-auth'

// GET /api/roles - Get all roles
export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()
    
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const includePermissions = searchParams.get('includePermissions') === 'true'

    let query = supabase
      .from('roles')
      .select(`
        *,
        ${includePermissions ? 'role_permissions(permission:permissions(*))' : ''}
      `)
      .order('level', { ascending: false })
      .order('display_name', { ascending: true })

    const { data: roles, error } = await query

    if (error) {
      console.error('Error fetching roles:', error)
      return NextResponse.json(
        { error: 'Failed to fetch roles' },
        { status: 500 }
      )
    }

    // Get user counts for each role
    const rolesWithCounts = await Promise.all(
      (roles || []).map(async (role: any) => {
        const { count } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('role_id', role.id)
        
        return {
          ...role,
          user_count: [{ count: count || 0 }],
        }
      })
    )

    return NextResponse.json({ roles: rolesWithCounts })
  } catch (error: any) {
    console.error('Error in GET /api/roles:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/roles - Create a new role
export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
    
    const body = await request.json()
    const { name, display_name, description, level, permissions } = body

    if (!name || !display_name) {
      return NextResponse.json(
        { error: 'Role name and display name are required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Check if role with same name exists
    const { data: existing } = await supabase
      .from('roles')
      .select('id')
      .eq('name', name)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 400 }
      )
    }

    // Create role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .insert({
        name,
        display_name,
        description,
        level: level || 0,
      })
      .select()
      .single()

    if (roleError || !role) {
      return NextResponse.json(
        { error: 'Failed to create role' },
        { status: 500 }
      )
    }

    // Add permissions if provided
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      const permissionInserts = permissions.map((permissionId: string) => ({
        role_id: role.id,
        permission_id: permissionId,
        granted: true,
      }))

      await supabase.from('role_permissions').insert(permissionInserts)
    }

    // Fetch complete role with permissions
    const { data: completeRole } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions(permission:permissions(*))
      `)
      .eq('id', role.id)
      .single()

    return NextResponse.json({ role: completeRole })
  } catch (error: any) {
    console.error('Error in POST /api/roles:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
