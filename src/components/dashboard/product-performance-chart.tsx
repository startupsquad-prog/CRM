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
import { ProductPerformance } from "@/lib/analytics/dashboard"

interface ProductPerformanceChartProps {
  data?: ProductPerformance[]
  isLoading?: boolean
}

const chartConfig = {
  leadCount: {
    label: "Leads",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ProductPerformanceChart({
  data,
  isLoading,
}: ProductPerformanceChartProps) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Products by lead count and revenue</CardDescription>
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
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Products by lead count and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No product data available
          </div>
        </CardContent>
      </Card>
    )
  }

  const chartData = data.slice(0, 10).map((product) => ({
    name: product.productName.length > 20
      ? product.productName.substring(0, 20) + "..."
      : product.productName,
    leads: product.leadCount,
    revenue: product.revenue,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>
          Top {data.length} products by performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 40, right: 10 }}
          >
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={100}
              tickMargin={8}
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
            <Bar
              dataKey="leads"
              fill="var(--color-leadCount)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

