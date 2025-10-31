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
import { formatDistanceToNow } from "date-fns"
import {
  FileText,
  ShoppingCart,
  UserPlus,
} from "lucide-react"

interface RecentActivityItem {
  type: "lead" | "order" | "quotation"
  id: string
  title: string
  subtitle: string
  value?: number
  status?: string
  createdAt: string
}

interface RecentActivityProps {
  data?: RecentActivityItem[]
  isLoading?: boolean
}

function getActivityIcon(type: RecentActivityItem["type"]) {
  switch (type) {
    case "lead":
      return UserPlus
    case "order":
      return ShoppingCart
    case "quotation":
      return FileText
    default:
      return FileText
  }
}

function getActivityColor(type: RecentActivityItem["type"]) {
  switch (type) {
    case "lead":
      return "bg-blue-500/10 text-blue-500"
    case "order":
      return "bg-green-500/10 text-green-500"
    case "quotation":
      return "bg-purple-500/10 text-purple-500"
    default:
      return "bg-muted"
  }
}

function formatStatus(status?: string): string {
  if (!status) return ""
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function RecentActivity({ data, isLoading }: RecentActivityProps) {
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest leads, orders, and quotations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest leads, orders, and quotations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No recent activity
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest leads, orders, and quotations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.slice(0, 10).map((activity) => {
            const Icon = getActivityIcon(activity.type)
            const colorClass = getActivityColor(activity.type)

            return (
              <div
                key={`${activity.type}-${activity.id}`}
                className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${colorClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{activity.title}</p>
                    {activity.status && (
                      <Badge variant="outline" className="text-xs">
                        {formatStatus(activity.status)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activity.subtitle}
                  </p>
                  {activity.value && (
                    <p className="text-xs font-medium">
                      ${activity.value.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

