import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { getOrSyncCurrentUser } from '@/lib/user-sync'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ count: 0 })
    }

    const supabase = createServerSupabaseClient()
    const currentUser = await getOrSyncCurrentUser()
    
    if (!currentUser) {
      return NextResponse.json({ count: 0 })
    }

    // Get count of quotations created by current user
    const { count, error } = await supabase
      .from('quotations')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', currentUser.id)

    if (error) {
      console.error('Error fetching quotations count:', error)
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch (error) {
    console.error('Error in GET /api/quotations/count:', error)
    return NextResponse.json({ count: 0 })
  }
}

