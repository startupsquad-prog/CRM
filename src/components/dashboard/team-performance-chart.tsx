"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { TeamPerformance } from "@/lib/analytics/dashboard"

interface TeamPerformanceChartProps {
  data?: TeamPerformance[]
  isLoading?: boolean
}

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  leads: {
    label: "Leads",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function TeamPerformanceChart({
  data,
  isLoading,
}: TeamPerformanceChartProps) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Sales team performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
          <CardDescription>Sales team performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No team data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.map((member) => ({
    name: member.userName.length > 15
      ? member.userName.substring(0, 15) + "..."
      : member.userName,
    revenue: member.revenue,
    leads: member.leadCount,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
        <CardDescription>
          Revenue and leads by team member
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                if (value >= 1000) return `${value / 1000}k`
                return value.toString()
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value, name) => [
                    name === "revenue"
                      ? `$${Number(value).toLocaleString()}`
                      : value,
                    name === "revenue" ? "Revenue" : "Leads",
                  ]}
                />
              }
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
            <Bar dataKey="leads" fill="var(--color-leads)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

