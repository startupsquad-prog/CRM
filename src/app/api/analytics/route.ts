import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { requireAdmin } from "@/lib/clerk-auth"
import {
  getKPIs,
  getLeadAnalytics,
  getRevenueTrends,
  getQuotationAnalytics,
  getProductAnalytics,
  getTeamPerformance,
  getRecentActivity,
  TimeRange,
} from "@/lib/analytics/dashboard"

export async function GET(request: NextRequest) {
  try {
    // Authenticate with Clerk and require admin for analytics
    await requireAdmin()

    const searchParams = request.nextUrl.searchParams
    const endpoint = searchParams.get("endpoint")
    const timeRange = (searchParams.get("timeRange") || "30d") as TimeRange
    const limit = parseInt(searchParams.get("limit") || "10")

    switch (endpoint) {
      case "kpis": {
        const kpis = await getKPIs()
        return NextResponse.json({ data: kpis })
      }

      case "leads": {
        const leadAnalytics = await getLeadAnalytics()
        return NextResponse.json({ data: leadAnalytics })
      }

      case "revenue": {
        const revenueTrends = await getRevenueTrends(timeRange)
        return NextResponse.json({ data: revenueTrends })
      }

      case "quotations": {
        const quotationAnalytics = await getQuotationAnalytics()
        return NextResponse.json({ data: quotationAnalytics })
      }

      case "products": {
        const productAnalytics = await getProductAnalytics()
        return NextResponse.json({ data: productAnalytics })
      }

      case "team": {
        const teamPerformance = await getTeamPerformance()
        return NextResponse.json({ data: teamPerformance })
      }

      case "activity": {
        const activity = await getRecentActivity(limit)
        return NextResponse.json({ data: activity })
      }

      default:
        return NextResponse.json(
          { error: "Invalid endpoint. Use: kpis, leads, revenue, quotations, products, team, or activity" },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error("Error in GET /api/analytics:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

