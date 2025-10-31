import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getOrSyncCurrentUser } from '@/lib/user-sync'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    const currentUser = await getOrSyncCurrentUser()

    if (!currentUser) {
      return NextResponse.json({ calls: [] })
    }

    const { data, error } = await supabase
      .from('calls')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching calls:', error)
      return NextResponse.json({ error: 'Failed to fetch calls' }, { status: 500 })
    }

    return NextResponse.json({ calls: data || [] })
  } catch (error) {
    console.error('Error in GET /api/calls:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

