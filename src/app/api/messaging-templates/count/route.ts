import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ count: 0 })
    }

    const supabase = createServerSupabaseClient()

    // Try to get count from messaging_templates table if it exists
    // Fallback to 0 if table doesn't exist
    const { count, error } = await supabase
      .from('messaging_templates')
      .select('*', { count: 'exact', head: true })

    if (error) {
      // If table doesn't exist, return 0
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({ count: 0 })
      }
      console.error('Error fetching messaging templates count:', error)
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch (error) {
    console.error('Error in GET /api/messaging-templates/count:', error)
    return NextResponse.json({ count: 0 })
  }
}

