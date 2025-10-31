import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from './supabase/server'

// Helper to safely get clerkClient
function getClerkClient() {
  if (!clerkClient || !clerkClient.users) {
    throw new Error('clerkClient is not properly initialized. Make sure CLERK_SECRET_KEY is set in environment variables.')
  }
  return clerkClient
}

export interface UserProfile {
  clerk_user_id: string
  email: string
  full_name: string | null
  role: 'admin' | 'employee'
  phone: string | null
  avatar_url: string | null
  department_id: string | null
  is_active: boolean
}

/**
 * Helper function to sync user_roles table
 */
async function syncUserRole(
  userId: string, 
  roleName: 'admin' | 'employee', 
  supabase: any
): Promise<void> {
  try {
    // Get the role_id for the role name
    const { data: role } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single()

    if (!role) {
      console.error(`Role not found: ${roleName}`)
      return
    }

    // Delete existing user_roles for this user
    await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    // Insert the new role as primary
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: role.id,
        is_primary: true,
      })

    if (insertError) {
      console.error('Error syncing user role:', insertError)
    }
  } catch (error) {
    console.error('Error in syncUserRole:', error)
    // Don't throw - this is a secondary sync operation
  }
}

/**
 * Sync Clerk user to Supabase users table
 * This is called automatically via webhook and can also be called manually
 */
export async function syncUserToSupabase(clerkUserId: string): Promise<void> {
  try {
    // Try to use currentUser first if it's the same user
    const current = await currentUser()
    let clerkUser = current?.id === clerkUserId ? current : null
    
    // If not the current user or current user doesn't match, use clerkClient
    if (!clerkUser) {
      const client = getClerkClient()
      clerkUser = await client.users.getUser(clerkUserId)
    }
    
    if (!clerkUser) {
      throw new Error(`Clerk user not found: ${clerkUserId}`)
    }

    const supabase = createServerSupabaseClient()

    // Get role from Clerk public metadata (default to 'employee')
    const role = (clerkUser.publicMetadata?.role as 'admin' | 'employee') || 'employee'

    // Prepare user data
    const userData: Omit<UserProfile, 'department_id'> & { department_id?: string | null } = {
      clerk_user_id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      full_name: clerkUser.fullName || clerkUser.firstName || clerkUser.lastName || null,
      role,
      phone: clerkUser.phoneNumbers[0]?.phoneNumber || null,
      avatar_url: clerkUser.imageUrl || null,
      is_active: !clerkUser.banned,
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (existingUser) {
      // Update existing user
      const { error } = await supabase
        .from('users')
        .update({
          ...userData,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', clerkUserId)

      if (error) {
        console.error('Error updating user in Supabase:', error)
        throw error
      }

      // Sync user_roles table
      await syncUserRole(existingUser.id, role, supabase)
    } else {
      // Create new user
      // Note: We're using Clerk for auth, so we don't need auth.users
      // We generate a UUID for the Supabase users table
      
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          ...userData,
          id: crypto.randomUUID(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating user in Supabase:', error)
        throw error
      }

      // Sync user_roles table for new user
      if (newUser) {
        await syncUserRole(newUser.id, role, supabase)
      }
    }
  } catch (error) {
    console.error('Error syncing user to Supabase:', error)
    throw error
  }
}

/**
 * Get or sync current user from Clerk to Supabase
 * Returns the Supabase user record
 */
export async function getOrSyncCurrentUser() {
  const user = await currentUser()
  
  if (!user) {
    return null
  }

  const supabase = createServerSupabaseClient()

  // Try to get existing user
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', user.id)
    .single()

  if (existingUser && !fetchError) {
    return existingUser
  }

  // If user doesn't exist, sync it
  await syncUserToSupabase(user.id)

  // Fetch the newly created user
  const { data: syncedUser, error: syncError } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', user.id)
    .single()

  if (syncError) {
    console.error('Error fetching synced user:', syncError)
    return null
  }

  return syncedUser
}

/**
 * Get Supabase user ID from Clerk user ID
 */
export async function getSupabaseUserIdFromClerk(clerkUserId: string): Promise<string | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (error || !data) {
    return null
  }

  return data.id
}

/**
 * Get Clerk user ID from Supabase user ID
 */
export async function getClerkUserIdFromSupabase(supabaseUserId: string): Promise<string | null> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('users')
    .select('clerk_user_id')
    .eq('id', supabaseUserId)
    .single()

  if (error || !data) {
    return null
  }

  return data.clerk_user_id
}

