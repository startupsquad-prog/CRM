import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/nextjs/server'

// POST /api/quick-login - Quick login with role switching for development
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { role } = body

    if (!role || !['admin', 'employee'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "employee"' },
        { status: 400 }
      )
    }

    // Update user role in Clerk public metadata
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role }
    })

    // Also sync to Supabase users table
    const supabase = createServerSupabaseClient()
    await supabase
      .from('users')
      .update({ role, updated_at: new Date().toISOString() })
      .eq('clerk_user_id', userId)

    return NextResponse.json({ 
      success: true, 
      role,
      message: `Successfully switched to ${role} role`
    })
  } catch (error: any) {
    console.error('Error in POST /api/quick-login:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

