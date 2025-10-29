"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
  TrendingDown, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Briefcase,
  CheckCircle2,
  Clock 
} from "lucide-react"

type SectionCardsProps = {
  role?: 'admin' | 'employee'
}

export function SectionCards({ role = 'employee' }: SectionCardsProps) {
  const adminStats = [
    {
      title: "Total Revenue",
      value: "$45,231.89",
      description: "+20.1% from last month",
      icon: DollarSign,
      trend: "up" as const,
    },
    {
      title: "Active Users",
      value: "2,350",
      description: "+180.1% from last month",
      icon: Users,
      trend: "up" as const,
    },
    {
      title: "New Customers",
      value: "1,234",
      description: "+19% from last month",
      icon: Users,
      trend: "up" as const,
    },
    {
      title: "Churn Rate",
      value: "12.5%",
      description: "-2% from last month",
      icon: TrendingDown,
      trend: "down" as const,
    },
  ]

  const employeeStats = [
    {
      title: "My Tasks",
      value: "12",
      description: "8 in progress",
      icon: Briefcase,
      trend: "up" as const,
    },
    {
      title: "Completed",
      value: "45",
      description: "+5 this week",
      icon: CheckCircle2,
      trend: "up" as const,
    },
    {
      title: "Pending",
      value: "3",
      description: "Due soon",
      icon: Clock,
      trend: "down" as const,
    },
    {
      title: "Performance",
      value: "94%",
      description: "+4% improvement",
      icon: TrendingUp,
      trend: "up" as const,
    },
  ]

  const stats = role === 'admin' ? adminStats : employeeStats

  return (
    <div className="grid gap-4 px-4 md:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <CardDescription className="flex items-center gap-1 pt-1 text-xs">
              {stat.trend === "up" ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              {stat.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
