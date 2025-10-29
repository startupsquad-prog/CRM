import { auth, currentUser } from '@clerk/nextjs/server'

export type UserRole = 'admin' | 'employee'

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

    // Check if user has admin role in public metadata or organization role
    // You can customize this logic based on your Clerk setup
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

export async function requireAuth() {
  const { userId } = await auth()
  
  if (!userId) {
    throw new Error('Unauthorized')
  }
  
  return userId
}

export async function requireAdmin() {
  const role = await getUserRole()
  
  if (role !== 'admin') {
    throw new Error('Forbidden: Admin access required')
  }
  
  return role
}

