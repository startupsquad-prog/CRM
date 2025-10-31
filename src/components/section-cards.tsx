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

type SectionCardsProps = {
  role?: 'admin' | 'employee'
}

export function SectionCards({ role = 'employee' }: SectionCardsProps) {
  const adminStats = [
    {
      title: "Total Revenue",
      value: "$1,250.00",
      description: "Trending up this month",
      icon: IconTrendingUp,
      trend: "up" as const,
    },
    {
      title: "New Customers",
      value: "1,234",
      description: "Down 20% this period",
      icon: IconTrendingDown,
      trend: "down" as const,
    },
    {
      title: "Active Accounts",
      value: "45,678",
      description: "Strong user retention",
      icon: IconTrendingUp,
      trend: "up" as const,
    },
    {
      title: "Growth Rate",
      value: "4.5%",
      description: "Steady performance increase",
      icon: IconTrendingUp,
      trend: "up" as const,
    },
  ]

  const employeeStats = [
    {
      title: "My Tasks",
      value: "12",
      description: "8 in progress",
      icon: IconTrendingUp,
      trend: "up" as const,
    },
    {
      title: "Completed",
      value: "45",
      description: "+5 this week",
      icon: IconTrendingUp,
      trend: "up" as const,
    },
    {
      title: "Pending",
      value: "3",
      description: "Due soon",
      icon: IconTrendingDown,
      trend: "down" as const,
    },
    {
      title: "Performance",
      value: "94%",
      description: "+4% improvement",
      icon: IconTrendingUp,
      trend: "up" as const,
    },
  ]

  const stats = role === 'admin' ? adminStats : employeeStats

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
              <Badge variant="outline">
                {stat.trend === "up" ? <IconTrendingUp /> : <IconTrendingDown />}
                {stat.description.includes('+') || stat.description.includes('-') ? stat.description.split(' ')[0] : ''}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {stat.description} {stat.trend === "up" ? <IconTrendingUp className="size-4" /> : <IconTrendingDown className="size-4" />}
            </div>
            <div className="text-muted-foreground">
              {stat.title === "Total Revenue" && "Visitors for the last 6 months"}
              {stat.title === "New Customers" && "Acquisition needs attention"}
              {stat.title === "Active Accounts" && "Engagement exceed targets"}
              {stat.title === "Growth Rate" && "Meets growth projections"}
              {stat.title === "My Tasks" && "Tasks assigned to you"}
              {stat.title === "Completed" && "Tasks completed this period"}
              {stat.title === "Pending" && "Tasks due soon"}
              {stat.title === "Performance" && "Your overall performance"}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
