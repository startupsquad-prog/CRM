import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()

    // Get total leads count
    const { count: totalLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })

    // Get active deals (leads not won or lost)
    const { count: activeDeals } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .not('stage', 'eq', 'won')
      .not('stage', 'eq', 'lost')

    // Get conversion rate (won / total)
    const { count: wonLeads } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('stage', 'won')

    const conversionRate = totalLeads && totalLeads > 0
      ? Math.round((wonLeads || 0) / totalLeads * 100)
      : 0

    // Calculate average deal value (placeholder - would need quotations data)
    const avgDealValue = 0

    return NextResponse.json({
      stats: {
        totalLeads: totalLeads || 0,
        activeDeals: activeDeals || 0,
        conversionRate,
        avgDealValue,
      }
    })
  } catch (error) {
    console.error('Error in GET /api/leads/stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

