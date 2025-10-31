import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getOrSyncCurrentUser } from './user-sync'

export type UserRole = 'admin' | 'employee'

/**
 * Get user role from Clerk public metadata
 */
export async function getUserRole(): Promise<UserRole | null> {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return null
    }

    const user = await currentUser()
    
    if (!user) {
      return null
    }

    // Check if user has admin role in public metadata
    const role = user.publicMetadata?.role as UserRole | undefined
    
    if (role === 'admin' || role === 'employee') {
      return role
    }

    // Default to employee if no role is set
    return 'employee'
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

/**
 * Require authentication - redirects to marketing if not authenticated
 */
export async function requireAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/marketing')
  }

  // Sync user in background (don't block)
  try {
    getOrSyncCurrentUser().catch(console.error)
  } catch (error) {
    // Ignore sync errors - don't block the request
  }
  
  return userId
}

/**
 * Require admin role - redirects to employee dashboard if not admin
 */
export async function requireAdmin() {
  const userId = await requireAuth()
  const role = await getUserRole()
  
  if (role !== 'admin') {
    redirect('/employee/dashboard')
  }
  
  return { userId, role }
}

/**
 * Require admin role for API routes - throws error instead of redirect
 */
export async function requireAdminAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  const role = await getUserRole()
  
  if (role !== 'admin') {
    throw new Error('Admin access required')
  }
  
  return { userId, role }
}

/**
 * Get current user's Supabase user record
 * Syncs user if doesn't exist
 */
export async function getCurrentSupabaseUser() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  return await getOrSyncCurrentUser()
}
