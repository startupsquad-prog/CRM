import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { KPIMetrics } from "@/lib/analytics/dashboard"

interface KPICardsProps {
  kpis?: KPIMetrics
  isLoading?: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value)
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function KPICards({ kpis, isLoading }: KPICardsProps) {
  if (isLoading || !kpis) {
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-2 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 w-full max-w-full min-w-0">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="@container/card">
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 mt-2" />
            </CardHeader>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(kpis.totalRevenue),
      description: `Growth ${kpis.revenueGrowth >= 0 ? "+" : ""}${formatPercentage(kpis.revenueGrowth)}`,
      icon: kpis.revenueGrowth >= 0 ? IconTrendingUp : IconTrendingDown,
      trend: kpis.revenueGrowth >= 0 ? ("up" as const) : ("down" as const),
      subtitle: "Revenue from all orders",
    },
    {
      title: "Active Leads",
      value: formatNumber(kpis.activeLeads),
      description: `${kpis.totalLeads} total leads`,
      icon: IconTrendingUp,
      trend: "up" as const,
      subtitle: "Leads in pipeline",
    },
    {
      title: "Conversion Rate",
      value: formatPercentage(kpis.conversionRate),
      description: `${kpis.wonLeads} won out of ${kpis.totalLeads}`,
      icon: kpis.conversionRate > 20 ? IconTrendingUp : IconTrendingDown,
      trend: kpis.conversionRate > 20 ? ("up" as const) : ("down" as const),
      subtitle: "Lead to win rate",
    },
    {
      title: "Pending Quotations",
      value: formatNumber(kpis.pendingQuotations),
      description: "Awaiting response",
      icon: IconTrendingUp,
      trend: "up" as const,
      subtitle: "Quotes sent to clients",
    },
    {
      title: "Orders This Month",
      value: formatNumber(kpis.ordersThisMonth),
      description: "Current month orders",
      icon: IconTrendingUp,
      trend: "up" as const,
      subtitle: "Orders created this month",
    },
    {
      title: "Revenue Growth",
      value: `${kpis.revenueGrowth >= 0 ? "+" : ""}${formatPercentage(kpis.revenueGrowth)}`,
      description: "Month-over-month",
      icon: kpis.revenueGrowth >= 0 ? IconTrendingUp : IconTrendingDown,
      trend: kpis.revenueGrowth >= 0 ? ("up" as const) : ("down" as const),
      subtitle: "Revenue change",
    },
    {
      title: "Average Deal Size",
      value: formatCurrency(kpis.averageDealSize),
      description: "Per accepted quote",
      icon: IconTrendingUp,
      trend: "up" as const,
      subtitle: "Average quotation value",
    },
    {
      title: "Total Leads",
      value: formatNumber(kpis.totalLeads),
      description: `${kpis.wonLeads} won, ${kpis.activeLeads} active`,
      icon: IconTrendingUp,
      trend: "up" as const,
      subtitle: "All time lead count",
    },
  ]

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 sm:grid-cols-2 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 w-full max-w-full min-w-0">
      {stats.map((stat) => (
        <Card key={stat.title} className="@container/card">
          <CardHeader>
            <CardDescription>{stat.title}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {stat.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline" className="flex items-center gap-1">
                {stat.trend === "up" ? (
                  <IconTrendingUp className="h-3 w-3" />
                ) : (
                  <IconTrendingDown className="h-3 w-3" />
                )}
                {stat.description.includes("+") || stat.description.includes("-")
                  ? stat.description.split(" ")[0]
                  : ""}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {stat.description}
              {stat.trend === "up" ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">{stat.subtitle}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

