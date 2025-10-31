"use client"

import { Cell, Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { QuotationAnalytics } from "@/lib/analytics/dashboard"

interface QuotationStatusChartProps {
  data?: QuotationAnalytics
  isLoading?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  draft: "hsl(var(--chart-1))",
  sent: "hsl(var(--chart-2))",
  accepted: "hsl(var(--chart-3))",
  rejected: "hsl(var(--chart-4))",
  expired: "hsl(var(--chart-5))",
}

export function QuotationStatusChart({
  data,
  isLoading,
}: QuotationStatusChartProps) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quotation Status</CardTitle>
          <CardDescription>Distribution of quotations by status</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full rounded-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.byStatus.map((item) => ({
    status: item.status,
    count: item.count,
    totalValue: item.totalValue,
    fill: STATUS_COLORS[item.status] || "hsl(var(--muted))",
  }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quotation Status</CardTitle>
          <CardDescription>Distribution of quotations by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No quotation data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartConfig = chartData.reduce(
    (acc, item) => {
      acc[item.status] = {
        label: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        color: item.fill,
      }
      return acc
    },
    {} as ChartConfig
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quotation Status</CardTitle>
        <CardDescription>
          {data.totalQuotations} quotations worth ${data.totalValue.toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => [
                    `${props.payload.count} quotations`,
                    `${props.payload.status}: $${Number(value).toLocaleString()}`,
                  ]}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="totalValue"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              label={({ status, count }) => `${status}: ${count}`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="status" />}
              className="-bottom-2"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

