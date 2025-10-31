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
    
    // Check if we want assigned leads only (for sidebar counter)
    const searchParams = request.nextUrl.searchParams
    const assignedOnly = searchParams.get('assigned') === 'true'
    
    if (assignedOnly) {
      // Get current user's Supabase ID
      const currentUser = await getOrSyncCurrentUser()
      
      if (!currentUser) {
        return NextResponse.json({ count: 0 })
      }

      // Get count of leads assigned to current user
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', currentUser.id)

      if (error) {
        console.error('Error fetching assigned leads count:', error)
        return NextResponse.json({ count: 0 })
      }

      return NextResponse.json({ count: count ?? 0 })
    } else {
      // Get total count of all leads (for tab title)
      const { count, error } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })

      if (error) {
        console.error('Error fetching leads count:', error)
        return NextResponse.json({ count: 0 })
      }

      return NextResponse.json({ count: count ?? 0 })
    }
  } catch (error) {
    console.error('Error in GET /api/leads/count:', error)
    return NextResponse.json({ count: 0 })
  }
}

