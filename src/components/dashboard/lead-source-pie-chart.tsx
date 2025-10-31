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
import { LeadAnalytics } from "@/lib/analytics/dashboard"

interface LeadSourcePieChartProps {
  data?: LeadAnalytics
  isLoading?: boolean
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function LeadSourcePieChart({
  data,
  isLoading,
}: LeadSourcePieChartProps) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Sources</CardTitle>
          <CardDescription>Distribution of leads by source</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full rounded-full" />
        </CardContent>
      </Card>
    )
  }

  const chartData = data.bySource
    .map((item, index) => ({
      source: item.source,
      count: item.count,
      fill: COLORS[index % COLORS.length],
    }))
    .slice(0, 10) // Limit to top 10 sources

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Sources</CardTitle>
          <CardDescription>Distribution of leads by source</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No source data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartConfig = chartData.reduce(
    (acc, item) => {
      acc[item.source] = {
        label: item.source,
        color: item.fill,
      }
      return acc
    },
    {} as ChartConfig
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Sources</CardTitle>
        <CardDescription>
          Top {chartData.length} lead sources by count
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    value,
                    `${name}: ${value} leads`,
                  ]}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="source"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ source, count }) => `${source}: ${count}`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="source" />}
              className="-bottom-2"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

