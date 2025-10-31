import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAdminAuth } from '@/lib/clerk-auth'
import { clerkClient } from '@clerk/nextjs/server'

// GET /api/users/[id] - Get a specific user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth()
    
    const supabase = createServerSupabaseClient()

    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        department:departments(id, name, description),
        user_roles(
          role:roles(id, name, display_name, description, level, is_primary)
        ),
        user_groups(
          group:groups(id, name, description, color, is_primary)
        )
      `)
      .eq('id', params.id)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error('Error in GET /api/users/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/users/[id] - Update a user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth()
    
    const body = await request.json()
    const {
      full_name,
      phone,
      department_id,
      role,
      is_active,
      bio,
      job_title,
      timezone,
      language,
      groups,
      roles: userRoles,
    } = body

    const supabase = createServerSupabaseClient()

    // Get user's clerk_user_id
    const { data: user } = await supabase
      .from('users')
      .select('clerk_user_id, role')
      .eq('id', params.id)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Update user in Supabase
    const updateData: any = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (phone !== undefined) updateData.phone = phone
    if (department_id !== undefined) updateData.department_id = department_id
    if (role !== undefined) updateData.role = role
    if (is_active !== undefined) updateData.is_active = is_active
    if (bio !== undefined) updateData.bio = bio
    if (job_title !== undefined) updateData.job_title = job_title
    if (timezone !== undefined) updateData.timezone = timezone
    if (language !== undefined) updateData.language = language

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update user' },
        { status: 500 }
      )
    }

    // Update role in Clerk if changed
    if (role && user.clerk_user_id) {
      try {
        await clerkClient.users.updateUserMetadata(user.clerk_user_id, {
          publicMetadata: {
            role: role,
          },
        })
      } catch (clerkError) {
        console.error('Error updating Clerk metadata:', clerkError)
      }
    }

    // Update user roles if provided
    if (userRoles !== undefined && Array.isArray(userRoles)) {
      // Delete existing roles
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', params.id)

      // Insert new roles
      if (userRoles.length > 0) {
        const roleInserts = userRoles.map((roleId: string, index: number) => ({
          user_id: params.id,
          role_id: roleId,
          is_primary: index === 0, // First role is primary
        }))

        await supabase.from('user_roles').insert(roleInserts)
      }
    }

    // Update user groups if provided
    if (groups !== undefined && Array.isArray(groups)) {
      // Delete existing groups
      await supabase
        .from('user_groups')
        .delete()
        .eq('user_id', params.id)

      // Insert new groups
      if (groups.length > 0) {
        const groupInserts = groups.map((groupId: string, index: number) => ({
          user_id: params.id,
          group_id: groupId,
          is_primary: index === 0, // First group is primary
        }))

        await supabase.from('user_groups').insert(groupInserts)
      }
    }

    // Fetch updated user
    const { data: updatedUser } = await supabase
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
      .eq('id', params.id)
      .single()

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error('Error in PATCH /api/users/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/users/[id] - Delete/deactivate a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminAuth()
    
    const supabase = createServerSupabaseClient()

    // Get user
    const { data: user } = await supabase
      .from('users')
      .select('id, clerk_user_id')
      .eq('id', params.id)
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Instead of deleting, deactivate the user
    const { error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('id', params.id)

    if (error) {
      return NextResponse.json(
        { error: 'Failed to deactivate user' },
        { status: 500 }
      )
    }

    // Optionally ban user in Clerk
    if (user.clerk_user_id) {
      try {
        await clerkClient.users.updateUserMetadata(user.clerk_user_id, {
          publicMetadata: {
            banned: true,
          },
        })
      } catch (clerkError) {
        console.error('Error banning user in Clerk:', clerkError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error in DELETE /api/users/[id]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
