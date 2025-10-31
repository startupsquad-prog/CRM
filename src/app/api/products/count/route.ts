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

    // Get count of all products (accessible to all authenticated users)
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (error) {
      console.error('Error fetching products count:', error)
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch (error) {
    console.error('Error in GET /api/products/count:', error)
    return NextResponse.json({ count: 0 })
  }
}

