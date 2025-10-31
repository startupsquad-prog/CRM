import { createServerSupabaseClient } from "@/lib/supabase/server"

export type TimeRange = "7d" | "30d" | "90d" | "ytd"

export interface KPIMetrics {
  totalRevenue: number
  activeLeads: number
  conversionRate: number
  pendingQuotations: number
  ordersThisMonth: number
  revenueGrowth: number
  averageDealSize: number
  totalLeads: number
  wonLeads: number
}

export interface LeadAnalytics {
  byStage: { stage: string; count: number }[]
  bySource: { source: string; count: number }[]
  totalLeads: number
}

export interface RevenueTrend {
  date: string
  revenue: number
  orders: number
}

export interface QuotationAnalytics {
  byStatus: { status: string; count: number; totalValue: number }[]
  totalQuotations: number
  totalValue: number
}

export interface ProductPerformance {
  productId: string
  productName: string
  leadCount: number
  quotationCount: number
  orderCount: number
  revenue: number
}

export interface TeamPerformance {
  userId: string
  userName: string
  leadCount: number
  quotationCount: number
  orderCount: number
  revenue: number
}

/**
 * Get date range based on time range parameter
 */
function getDateRange(timeRange: TimeRange): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()

  switch (timeRange) {
    case "7d":
      start.setDate(end.getDate() - 7)
      break
    case "30d":
      start.setDate(end.getDate() - 30)
      break
    case "90d":
      start.setDate(end.getDate() - 90)
      break
    case "ytd":
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      break
  }

  start.setHours(0, 0, 0, 0)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Fetch and calculate all KPI metrics
 */
export async function getKPIs(): Promise<KPIMetrics> {
  const supabase = createServerSupabaseClient()

  // Total revenue from orders (all time, not cancelled/refunded)
  const { data: ordersData, error: ordersError } = await supabase
    .from("orders")
    .select("total_amount, created_at, status")
    .not("status", "in", "('cancelled', 'refunded')")

  if (ordersError) {
    console.error("Error fetching orders:", ordersError)
  }

  const totalRevenue =
    ordersData
      ?.filter((o) => !["cancelled", "refunded"].includes(o.status || ""))
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0

  // Active leads (not won or lost)
  const { count: activeLeadsCount, error: leadsError } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
    .not("stage", "in", "('won', 'lost')")

  if (leadsError) {
    console.error("Error fetching active leads:", leadsError)
  }

  // Total leads and won leads
  const { data: allLeads, error: allLeadsError } = await supabase
    .from("leads")
    .select("stage")

  if (allLeadsError) {
    console.error("Error fetching all leads:", allLeadsError)
  }

  const totalLeads = allLeads?.length || 0
  const wonLeads = allLeads?.filter((l) => l.stage === "won").length || 0
  const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0

  // Pending quotations
  const { count: pendingQuotationsCount, error: quotationsError } =
    await supabase
      .from("quotations")
      .select("*", { count: "exact", head: true })
      .eq("status", "sent")

  if (quotationsError) {
    console.error("Error fetching pending quotations:", quotationsError)
  }

  // Orders this month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const { count: ordersThisMonthCount, error: ordersMonthError } =
    await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfMonth.toISOString())

  if (ordersMonthError) {
    console.error("Error fetching orders this month:", ordersMonthError)
  }

  // Revenue growth (compare this month with last month)
  const lastMonthStart = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1
  )
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const { data: lastMonthOrders } = await supabase
    .from("orders")
    .select("total_amount, status")
    .gte("created_at", lastMonthStart.toISOString())
    .lte("created_at", lastMonthEnd.toISOString())

  const lastMonthRevenue =
    lastMonthOrders
      ?.filter((o) => !["cancelled", "refunded"].includes(o.status || ""))
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0

  const thisMonthRevenue =
    ordersData
      ?.filter(
        (o) =>
          !["cancelled", "refunded"].includes(o.status || "") &&
          new Date(o.created_at) >= startOfMonth
      )
      .reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0

  const revenueGrowth =
    lastMonthRevenue > 0
      ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : thisMonthRevenue > 0
        ? 100
        : 0

  // Average deal size (from accepted quotations)
  const { data: acceptedQuotations } = await supabase
    .from("quotations")
    .select("total_amount")
    .eq("status", "accepted")

  const averageDealSize =
    acceptedQuotations && acceptedQuotations.length > 0
      ? acceptedQuotations.reduce(
          (sum, q) => sum + Number(q.total_amount || 0),
          0
        ) / acceptedQuotations.length
      : 0

  return {
    totalRevenue,
    activeLeads: activeLeadsCount || 0,
    conversionRate: Number(conversionRate.toFixed(2)),
    pendingQuotations: pendingQuotationsCount || 0,
    ordersThisMonth: ordersThisMonthCount || 0,
    revenueGrowth: Number(revenueGrowth.toFixed(2)),
    averageDealSize: Number(averageDealSize.toFixed(2)),
    totalLeads,
    wonLeads,
  }
}

/**
 * Aggregate lead data by stage, source, etc.
 */
export async function getLeadAnalytics(): Promise<LeadAnalytics> {
  const supabase = createServerSupabaseClient()

  // Leads by stage
  const { data: leadsByStage, error: stageError } = await supabase
    .from("leads")
    .select("stage")

  if (stageError) {
    console.error("Error fetching leads by stage:", stageError)
  }

  const stageMap = new Map<string, number>()
  leadsByStage?.forEach((lead) => {
    const stage = lead.stage || "new"
    stageMap.set(stage, (stageMap.get(stage) || 0) + 1)
  })

  const byStage = Array.from(stageMap.entries()).map(([stage, count]) => ({
    stage,
    count,
  }))

  // Leads by source
  const { data: leadsBySource, error: sourceError } = await supabase
    .from("leads")
    .select("source")

  if (sourceError) {
    console.error("Error fetching leads by source:", sourceError)
  }

  const sourceMap = new Map<string, number>()
  leadsBySource?.forEach((lead) => {
    if (lead.source && Array.isArray(lead.source)) {
      lead.source.forEach((src: string) => {
        sourceMap.set(src, (sourceMap.get(src) || 0) + 1)
      })
    } else if (lead.source) {
      sourceMap.set(lead.source, (sourceMap.get(lead.source) || 0) + 1)
    }
  })

  const bySource = Array.from(sourceMap.entries())
    .map(([source, count]) => ({ source, count }))
    .filter((s) => s.source)

  return {
    byStage,
    bySource,
    totalLeads: leadsByStage?.length || 0,
  }
}

/**
 * Fetch revenue trends over time
 */
export async function getRevenueTrends(
  timeRange: TimeRange = "30d"
): Promise<RevenueTrend[]> {
  const supabase = createServerSupabaseClient()
  const { start, end } = getDateRange(timeRange)

  const { data: orders, error } = await supabase
    .from("orders")
    .select("total_amount, created_at, status")
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .not("status", "in", "('cancelled', 'refunded')")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching revenue trends:", error)
    return []
  }

  // Group by date
  const revenueMap = new Map<string, { revenue: number; orders: number }>()

  orders?.forEach((order) => {
    const date = new Date(order.created_at).toISOString().split("T")[0]
    const existing = revenueMap.get(date) || { revenue: 0, orders: 0 }
    revenueMap.set(date, {
      revenue: existing.revenue + Number(order.total_amount || 0),
      orders: existing.orders + 1,
    })
  })

  // Convert to array and fill missing dates
  const trends: RevenueTrend[] = []
  const currentDate = new Date(start)

  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split("T")[0]
    const data = revenueMap.get(dateStr) || { revenue: 0, orders: 0 }
    trends.push({
      date: dateStr,
      revenue: Number(data.revenue.toFixed(2)),
      orders: data.orders,
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return trends
}

/**
 * Quotation status and value analytics
 */
export async function getQuotationAnalytics(): Promise<QuotationAnalytics> {
  const supabase = createServerSupabaseClient()

  const { data: quotations, error } = await supabase
    .from("quotations")
    .select("status, total_amount")

  if (error) {
    console.error("Error fetching quotations:", error)
    return {
      byStatus: [],
      totalQuotations: 0,
      totalValue: 0,
    }
  }

  const statusMap = new Map<
    string,
    { count: number; totalValue: number }
  >()

  quotations?.forEach((quote) => {
    const status = quote.status || "draft"
    const existing = statusMap.get(status) || { count: 0, totalValue: 0 }
    statusMap.set(status, {
      count: existing.count + 1,
      totalValue: existing.totalValue + Number(quote.total_amount || 0),
    })
  })

  const byStatus = Array.from(statusMap.entries()).map(
    ([status, data]) => ({
      status,
      count: data.count,
      totalValue: Number(data.totalValue.toFixed(2)),
    })
  )

  const totalValue = byStatus.reduce(
    (sum, s) => sum + s.totalValue,
    0
  )

  return {
    byStatus,
    totalQuotations: quotations?.length || 0,
    totalValue,
  }
}

/**
 * Top products by performance
 */
export async function getProductAnalytics(): Promise<ProductPerformance[]> {
  const supabase = createServerSupabaseClient()

  // Try to use materialized view first
  const { data: productPerformance, error: viewError } = await supabase
    .from("product_performance")
    .select("*")
    .order("actual_lead_count", { ascending: false })
    .limit(10)

  if (!viewError && productPerformance && productPerformance.length > 0) {
    // Get revenue for each product from orders
    const productIds = productPerformance.map((p) => p.product_id)
    const { data: orders } = await supabase
      .from("orders")
      .select("items, total_amount, status")
      .not("status", "in", "('cancelled', 'refunded')")

    const productRevenueMap = new Map<string, number>()
    orders?.forEach((order) => {
      if (order.items && typeof order.items === "object") {
        const items = Array.isArray(order.items) ? order.items : [order.items]
        items.forEach((item: any) => {
          if (item.product_id && productIds.includes(item.product_id)) {
            const existing = productRevenueMap.get(item.product_id) || 0
            productRevenueMap.set(
              item.product_id,
              existing + Number(item.price || 0) * Number(item.quantity || 1)
            )
          }
        })
      }
    })

    return productPerformance.map((p) => ({
      productId: p.product_id,
      productName: p.name || "Unknown",
      leadCount: p.actual_lead_count || 0,
      quotationCount: p.actual_quotation_count || 0,
      orderCount: p.actual_order_count || 0,
      revenue: Number((productRevenueMap.get(p.product_id) || 0).toFixed(2)),
    }))
  }

  // Fallback: fetch from products table
  const { data: products, error } = await supabase
    .from("products")
    .select("id, name, lead_count, quotation_count, order_count")
    .order("lead_count", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching products:", error)
    return []
  }

  return (
    products?.map((p) => ({
      productId: p.id,
      productName: p.name || "Unknown",
      leadCount: p.lead_count || 0,
      quotationCount: p.quotation_count || 0,
      orderCount: p.order_count || 0,
      revenue: 0, // Would need to calculate from orders
    })) || []
  )
}

/**
 * Sales team metrics
 */
export async function getTeamPerformance(): Promise<TeamPerformance[]> {
  const supabase = createServerSupabaseClient()

  // Try to use materialized view first
  const { data: salesPerformance, error: viewError } = await supabase
    .from("sales_performance")
    .select("*")
    .order("total_revenue", { ascending: false })

  if (!viewError && salesPerformance && salesPerformance.length > 0) {
    return salesPerformance.map((sp) => ({
      userId: sp.user_id,
      userName: sp.full_name || "Unknown",
      leadCount: sp.total_leads || 0,
      quotationCount: sp.total_quotations || 0,
      orderCount: sp.total_orders || 0,
      revenue: Number((sp.total_revenue || 0).toFixed(2)),
    }))
  }

  // Fallback: aggregate from users with leads/orders
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, full_name, role")
    .eq("role", "employee")

  if (usersError) {
    console.error("Error fetching users:", usersError)
    return []
  }

  const teamMetrics: TeamPerformance[] = []

  for (const user of users || []) {
    const { count: leadCount } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true })
      .eq("assigned_to", user.id)

    const { count: quotationCount } = await supabase
      .from("quotations")
      .select("*", { count: "exact", head: true })
      .eq("created_by", user.id)

    const { count: orderCount } = await supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("created_by", user.id)

    const { data: orders } = await supabase
      .from("orders")
      .select("total_amount, status")
      .eq("created_by", user.id)
      .not("status", "in", "('cancelled', 'refunded')")

    const revenue =
      orders?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0

    teamMetrics.push({
      userId: user.id,
      userName: user.full_name || "Unknown",
      leadCount: leadCount || 0,
      quotationCount: quotationCount || 0,
      orderCount: orderCount || 0,
      revenue: Number(revenue.toFixed(2)),
    })
  }

  return teamMetrics.sort((a, b) => b.revenue - a.revenue)
}

/**
 * Get recent activity (leads, orders, quotations)
 */
export async function getRecentActivity(limit: number = 10) {
  const supabase = createServerSupabaseClient()

  const [leadsResult, ordersResult, quotationsResult] = await Promise.all([
    supabase
      .from("leads")
      .select("id, full_name, stage, created_at, lead_id")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("orders")
      .select("id, order_id, total_amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("quotations")
      .select("id, quote_number, total_amount, status, created_at")
      .order("created_at", { ascending: false })
      .limit(limit),
  ])

  const activities: Array<{
    type: "lead" | "order" | "quotation"
    id: string
    title: string
    subtitle: string
    value?: number
    status?: string
    createdAt: string
  }> = []

  leadsResult.data?.forEach((lead) => {
    activities.push({
      type: "lead",
      id: lead.id,
      title: lead.full_name || "Unknown Lead",
      subtitle: `Lead ID: ${lead.lead_id || "N/A"}`,
      status: lead.stage || "new",
      createdAt: lead.created_at,
    })
  })

  ordersResult.data?.forEach((order) => {
    activities.push({
      type: "order",
      id: order.id,
      title: `Order ${order.order_id || "N/A"}`,
      subtitle: `Status: ${order.status || "pending"}`,
      value: Number(order.total_amount || 0),
      status: order.status || "pending",
      createdAt: order.created_at,
    })
  })

  quotationsResult.data?.forEach((quote) => {
    activities.push({
      type: "quotation",
      id: quote.id,
      title: `Quote ${quote.quote_number || "N/A"}`,
      subtitle: `Status: ${quote.status || "draft"}`,
      value: Number(quote.total_amount || 0),
      status: quote.status || "draft",
      createdAt: quote.created_at,
    })
  })

  // Sort by created_at and return top items
  return activities
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit)
}

