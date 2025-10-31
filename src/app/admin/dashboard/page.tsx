import { Suspense } from "react"
import { requireAdmin } from "@/lib/clerk-auth"
import {
  getKPIs,
  getLeadAnalytics,
  getRevenueTrends,
  getQuotationAnalytics,
  getProductAnalytics,
  getTeamPerformance,
  getRecentActivity,
} from "@/lib/analytics/dashboard"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { LeadPipelineChart } from "@/components/dashboard/lead-pipeline-chart"
import { RevenueTrendChart } from "@/components/dashboard/revenue-trend-chart"
import { LeadSourcePieChart } from "@/components/dashboard/lead-source-pie-chart"
import { QuotationStatusChart } from "@/components/dashboard/quotation-status-chart"
import { ProductPerformanceChart } from "@/components/dashboard/product-performance-chart"
import { TeamPerformanceChart } from "@/components/dashboard/team-performance-chart"
import { ConversionFunnel } from "@/components/dashboard/conversion-funnel"
import { RecentActivity } from "@/components/dashboard/recent-activity"

async function DashboardContent() {
  // Fetch all analytics data in parallel
  const [
    kpis,
    leadAnalytics,
    revenueTrends,
    quotationAnalytics,
    productAnalytics,
    teamPerformance,
    recentActivity,
  ] = await Promise.all([
    getKPIs(),
    getLeadAnalytics(),
    getRevenueTrends("30d"),
    getQuotationAnalytics(),
    getProductAnalytics(),
    getTeamPerformance(),
    getRecentActivity(10),
  ])

  // Calculate totals for conversion funnel
  const totalQuotations = quotationAnalytics.totalQuotations
  // Use total orders from team performance or calculate separately
  const totalOrders = teamPerformance.reduce((sum, member) => sum + member.orderCount, 0) || kpis.ordersThisMonth

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full max-w-full min-w-0">
        {/* KPI Cards */}
        <KPICards kpis={kpis} />

        {/* Charts Row 1: Lead Pipeline and Revenue Trends */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-2 w-full max-w-full min-w-0">
          <LeadPipelineChart data={leadAnalytics} />
          <RevenueTrendChart data={revenueTrends} />
        </div>

        {/* Charts Row 2: Lead Sources and Quotation Status */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-2 w-full max-w-full min-w-0">
          <LeadSourcePieChart data={leadAnalytics} />
          <QuotationStatusChart data={quotationAnalytics} />
        </div>

        {/* Charts Row 3: Product Performance and Team Performance */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-2 w-full max-w-full min-w-0">
          <ProductPerformanceChart data={productAnalytics} />
          <TeamPerformanceChart data={teamPerformance} />
        </div>

        {/* Charts Row 4: Conversion Funnel and Recent Activity */}
        <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-2 w-full max-w-full min-w-0">
          <ConversionFunnel
            totalLeads={kpis.totalLeads}
            totalQuotations={totalQuotations}
            totalOrders={kpis.ordersThisMonth}
          />
          <RecentActivity data={recentActivity} />
        </div>
      </div>
    </div>
  )
}

export default async function AdminDashboardPage() {
  await requireAdmin()

  return (
    <Suspense
      fallback={
        <div className="@container/main flex flex-1 flex-col gap-4 w-full max-w-full min-w-0 overflow-hidden">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full max-w-full min-w-0">
            <KPICards isLoading />
            <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-2 w-full max-w-full min-w-0">
              <LeadPipelineChart isLoading />
              <RevenueTrendChart isLoading />
              <LeadSourcePieChart isLoading />
              <QuotationStatusChart isLoading />
              <ProductPerformanceChart isLoading />
              <TeamPerformanceChart isLoading />
              <ConversionFunnel isLoading />
              <RecentActivity isLoading />
            </div>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
