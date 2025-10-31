import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/clerk-auth'
import { clerkClient } from '@clerk/nextjs/server'

// POST /api/users/invite - Invite a user via Clerk
export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()
    
    const body = await request.json()
    const { email, role = 'employee', metadata = {} } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Create invitation in Clerk
    const invitation = await clerkClient.invitations.createInvitation({
      emailAddress: email,
      publicMetadata: {
        role: role,
        ...metadata,
      },
    })

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        emailAddress: invitation.emailAddress,
        status: invitation.status,
      },
    })
  } catch (error: any) {
    console.error('Error in POST /api/users/invite:', error)
    
    if (error.errors) {
      return NextResponse.json(
        { error: error.errors[0]?.message || 'Failed to create invitation' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
