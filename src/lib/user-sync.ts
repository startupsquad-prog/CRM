import { currentUser, clerkClient } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from './supabase/server'

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
 * Sync Clerk user to Supabase users table
 * This is called automatically via webhook and can also be called manually
 */
export async function syncUserToSupabase(clerkUserId: string): Promise<void> {
  try {
    const clerkUser = await clerkClient.users.getUser(clerkUserId)
    
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
    } else {
      // Create new user
      // Note: We're using Clerk for auth, so we don't need auth.users
      // We generate a UUID for the Supabase users table
      
      const { error } = await supabase
        .from('users')
        .insert({
          ...userData,
          id: crypto.randomUUID(),
        })

      if (error) {
        console.error('Error creating user in Supabase:', error)
        throw error
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

