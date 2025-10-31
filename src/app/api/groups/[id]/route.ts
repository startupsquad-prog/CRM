import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/clerk-auth'

// GET /api/groups/[id] - Get a specific group
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth()
    
    const supabase = createServerSupabaseClient()

    const { data: group, error } = await supabase
      .from('groups')
      .select(`
        *,
        created_by_user:users!groups_created_by_fkey(id, full_name, email),
        parent_group:groups!groups_parent_group_id_fkey(id, name),
        user_groups(
          user:users(id, full_name, email, avatar_url, is_primary)
        ),
        group_permissions(
          permission:permissions(*)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ group })
  } catch (error: any) {
    console.error('Error in GET /api/groups/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/groups/[id] - Update a group
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth()
    
    const body = await request.json()
    const { name, description, color, icon, parent_group_id, is_active, permissions } = body

    const supabase = createServerSupabaseClient()

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (color !== undefined) updateData.color = color
    if (icon !== undefined) updateData.icon = icon
    if (parent_group_id !== undefined) updateData.parent_group_id = parent_group_id
    if (is_active !== undefined) updateData.is_active = is_active

    const { error: updateError } = await supabase
      .from('groups')
      .update(updateData)
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update group' },
        { status: 500 }
      )
    }

    // Update permissions if provided
    if (permissions !== undefined && Array.isArray(permissions)) {
      // Delete existing permissions
      await supabase
        .from('group_permissions')
        .delete()
        .eq('group_id', params.id)

      // Insert new permissions
      if (permissions.length > 0) {
        const permissionInserts = permissions.map((permissionId: string) => ({
          group_id: params.id,
          permission_id: permissionId,
          granted: true,
        }))

        await supabase.from('group_permissions').insert(permissionInserts)
      }
    }

    // Fetch updated group
    const { data: updatedGroup } = await supabase
      .from('groups')
      .select(`
        *,
        group_permissions(permission:permissions(*))
      `)
      .eq('id', params.id)
      .single()

    return NextResponse.json({ group: updatedGroup })
  } catch (error: any) {
    console.error('Error in PATCH /api/groups/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/groups/[id] - Delete a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth()
    
    const supabase = createServerSupabaseClient()

    // Check if group has users
    const { data: userGroups } = await supabase
      .from('user_groups')
      .select('id')
      .eq('group_id', params.id)
      .limit(1)

    if (userGroups && userGroups.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete group with members. Remove all members first.' },
        { status: 400 }
      )
    }

    // Delete group (permissions will be cascade deleted)
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete group' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/groups/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
