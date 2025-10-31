import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/clerk-auth'
import { getSupabaseUserIdFromClerk } from '@/lib/user-sync'
import { auth } from '@clerk/nextjs/server'

// GET /api/groups - Get all groups
export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()
    
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const includePermissions = searchParams.get('includePermissions') === 'true'

    let query = supabase
      .from('groups')
      .select(`
        *,
        created_by_user:users!groups_created_by_fkey(id, full_name, email),
        ${includePermissions ? 'group_permissions(permission:permissions(*))' : ''}
      `)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data: groups, error } = await query

    if (error) {
      console.error('Error fetching groups:', error)
      return NextResponse.json(
        { error: 'Failed to fetch groups' },
        { status: 500 }
      )
    }

    // Get user counts for each group
    const groupsWithCounts = await Promise.all(
      (groups || []).map(async (group: any) => {
        const { count } = await supabase
          .from('user_groups')
          .select('*', { count: 'exact', head: true })
          .eq('group_id', group.id)
        
        return {
          ...group,
          user_count: [{ count: count || 0 }],
        }
      })
    )

    return NextResponse.json({ groups: groupsWithCounts })
  } catch (error: any) {
    console.error('Error in GET /api/groups:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
    
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, color, icon, parent_group_id, permissions } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Group name is required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()
    const createdBy = await getSupabaseUserIdFromClerk(userId)

    // Create group
    const { data: group, error: groupError } = await supabase
      .from('groups')
      .insert({
        name,
        description,
        color,
        icon,
        parent_group_id,
        created_by: createdBy,
      })
      .select()
      .single()

    if (groupError || !group) {
      return NextResponse.json(
        { error: 'Failed to create group' },
        { status: 500 }
      )
    }

    // Add permissions if provided
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      const permissionInserts = permissions.map((permissionId: string) => ({
        group_id: group.id,
        permission_id: permissionId,
        granted: true,
      }))

      await supabase.from('group_permissions').insert(permissionInserts)
    }

    // Fetch complete group with permissions
    const { data: completeGroup } = await supabase
      .from('groups')
      .select(`
        *,
        group_permissions(permission:permissions(*))
      `)
      .eq('id', group.id)
      .single()

    return NextResponse.json({ group: completeGroup })
  } catch (error: any) {
    console.error('Error in POST /api/groups:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
