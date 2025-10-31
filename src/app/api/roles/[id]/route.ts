import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/clerk-auth'

// GET /api/roles/[id] - Get a specific role
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth()
    
    const supabase = createServerSupabaseClient()

    const { data: role, error } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions(permission:permissions(*)),
        user_count:user_roles(count)
      `)
      .eq('id', params.id)
      .single()

    if (error || !role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ role })
  } catch (error: any) {
    console.error('Error in GET /api/roles/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/roles/[id] - Update a role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth()
    
    const body = await request.json()
    const { display_name, description, level, permissions } = body

    const supabase = createServerSupabaseClient()

    // Check if role is system role
    const { data: role } = await supabase
      .from('roles')
      .select('is_system_role, name')
      .eq('id', params.id)
      .single()

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    // System roles can only update display_name and description
    if (role.is_system_role) {
      const updateData: any = {}
      if (display_name !== undefined) updateData.display_name = display_name
      if (description !== undefined) updateData.description = description

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('roles')
          .update(updateData)
          .eq('id', params.id)

        if (updateError) {
          return NextResponse.json(
            { error: 'Failed to update role' },
            { status: 500 }
          )
        }
      }
    } else {
      // Non-system roles can be fully updated
      const updateData: any = {}
      if (display_name !== undefined) updateData.display_name = display_name
      if (description !== undefined) updateData.description = description
      if (level !== undefined) updateData.level = level

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('roles')
          .update(updateData)
          .eq('id', params.id)

        if (updateError) {
          return NextResponse.json(
            { error: 'Failed to update role' },
            { status: 500 }
          )
        }
      }
    }

    // Update permissions if provided
    if (permissions !== undefined && Array.isArray(permissions)) {
      // Delete existing permissions
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', params.id)

      // Insert new permissions
      if (permissions.length > 0) {
        const permissionInserts = permissions.map((permissionId: string) => ({
          role_id: params.id,
          permission_id: permissionId,
          granted: true,
        }))

        await supabase.from('role_permissions').insert(permissionInserts)
      }
    }

    // Fetch updated role
    const { data: updatedRole } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions(permission:permissions(*))
      `)
      .eq('id', params.id)
      .single()

    return NextResponse.json({ role: updatedRole })
  } catch (error: any) {
    console.error('Error in PATCH /api/roles/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/roles/[id] - Delete a role
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth()
    
    const supabase = createServerSupabaseClient()

    // Check if role is system role
    const { data: role } = await supabase
      .from('roles')
      .select('is_system_role')
      .eq('id', params.id)
      .single()

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      )
    }

    if (role.is_system_role) {
      return NextResponse.json(
        { error: 'Cannot delete system role' },
        { status: 400 }
      )
    }

    // Check if role has users
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role_id', params.id)
      .limit(1)

    if (userRoles && userRoles.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete role with assigned users. Remove all assignments first.' },
        { status: 400 }
      )
    }

    // Delete role (permissions will be cascade deleted)
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to delete role' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/roles/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
