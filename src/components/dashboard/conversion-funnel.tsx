"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

interface ConversionFunnelProps {
  totalLeads?: number
  totalQuotations?: number
  totalOrders?: number
  isLoading?: boolean
}

export function ConversionFunnel({
  totalLeads,
  totalQuotations,
  totalOrders,
  isLoading,
}: ConversionFunnelProps) {
  if (isLoading || totalLeads === undefined) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>
            Lead to order conversion pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const leadToQuotationRate =
    totalLeads > 0 ? ((totalQuotations || 0) / totalLeads) * 100 : 0
  const quotationToOrderRate =
    (totalQuotations || 0) > 0
      ? ((totalOrders || 0) / (totalQuotations || 1)) * 100
      : 0
  const overallConversionRate =
    totalLeads > 0 ? ((totalOrders || 0) / totalLeads) * 100 : 0

  const stages = [
    {
      label: "Leads",
      value: totalLeads || 0,
      width: 100,
      color: "bg-primary",
    },
    {
      label: "Quotations",
      value: totalQuotations || 0,
      width: totalLeads > 0 ? (totalQuotations || 0) / totalLeads * 100 : 0,
      color: "bg-blue-500",
      rate: leadToQuotationRate,
    },
    {
      label: "Orders",
      value: totalOrders || 0,
      width:
        totalLeads > 0 ? (totalOrders || 0) / totalLeads * 100 : 0,
      color: "bg-green-500",
      rate: quotationToOrderRate,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>
          Lead to order conversion pipeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stages.map((stage, index) => (
            <div key={stage.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{stage.label}</span>
                  <Badge variant="secondary">{stage.value.toLocaleString()}</Badge>
                  {stage.rate !== undefined && (
                    <Badge variant="outline">
                      {stage.rate.toFixed(1)}% conversion
                    </Badge>
                  )}
                </div>
                {index === stages.length - 1 && (
                  <Badge variant="default">
                    {overallConversionRate.toFixed(1)}% overall
                  </Badge>
                )}
              </div>
              <div className="relative h-12 w-full rounded-lg bg-muted overflow-hidden">
                <div
                  className={`absolute left-0 top-0 h-full ${stage.color} transition-all duration-500 rounded-lg flex items-center justify-end pr-4`}
                  style={{ width: `${Math.max(stage.width, 5)}%` }}
                >
                  {stage.width > 15 && (
                    <span className="text-sm font-medium text-white">
                      {stage.value.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Overall conversion rate
              </span>
              <span className="font-semibold text-lg">
                {overallConversionRate.toFixed(2)}%
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {totalOrders || 0} orders from {totalLeads || 0} leads
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

