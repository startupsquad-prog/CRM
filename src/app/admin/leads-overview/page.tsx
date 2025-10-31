"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, Users, TrendingUp, PieChart, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminLeadsOverviewPage() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeDeals: 0,
    conversionRate: 0,
    avgDealValue: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/leads/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats || stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full max-w-full min-w-0">
        <div className="px-4 lg:px-6 w-full max-w-full min-w-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Leads Overview</h2>
            <p className="text-muted-foreground">
              System-wide lead management and distribution analysis
            </p>
          </div>
          
          {/* Quick Stats Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : stats.totalLeads}
                </div>
                <p className="text-xs text-muted-foreground">Across all employees</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : stats.activeDeals}
                </div>
                <p className="text-xs text-muted-foreground">In pipeline</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : `${stats.conversionRate}%`}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Deal Value</CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-24" /> : `₹${stats.avgDealValue.toLocaleString()}`}
                </div>
                <p className="text-xs text-muted-foreground">Per lead</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/admin/leads-overview/distribution">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    Lead Distribution
                    <ArrowRight className="h-4 w-4" />
                  </CardTitle>
                  <CardDescription>
                    View how leads are distributed across your team
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/admin/leads-overview/analytics">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    Lead Analytics
                    <ArrowRight className="h-4 w-4" />
                  </CardTitle>
                  <CardDescription>
                    Deep insights into lead performance and trends
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <Link href="/admin/leads-overview/rules">
                <CardHeader>
                  <CardTitle className="text-base flex items-center justify-between">
                    Assignment Rules
                    <ArrowRight className="h-4 w-4" />
                  </CardTitle>
                  <CardDescription>
                    Configure automatic lead assignment rules
                  </CardDescription>
                </CardHeader>
              </Link>
            </Card>
          </div>

          {/* Recent Activity or Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Lead Overview Summary</CardTitle>
              <CardDescription>
                Quick access to lead management features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">New Leads</div>
                  <div className="text-2xl font-bold mb-1">—</div>
                  <div className="text-xs text-muted-foreground">Last 7 days</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">Won Deals</div>
                  <div className="text-2xl font-bold mb-1">—</div>
                  <div className="text-xs text-muted-foreground">This month</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="font-medium mb-2">Lost Leads</div>
                  <div className="text-2xl font-bold mb-1">—</div>
                  <div className="text-xs text-muted-foreground">This month</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

