"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, TrendingUp } from "lucide-react"

interface Distribution {
  employeeId: string
  employeeName: string
  totalLeads: number
  activeLeads: number
  completedLeads: number
  conversionRate: number
}

export default function DistributionPage() {
  const [distributions, setDistributions] = useState<Distribution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDistribution()
  }, [])

  const fetchDistribution = async () => {
    try {
      // Simulate API call
      setTimeout(() => {
        setDistributions([
          {
            employeeId: '1',
            employeeName: 'John Doe',
            totalLeads: 25,
            activeLeads: 15,
            completedLeads: 10,
            conversionRate: 40
          },
          {
            employeeId: '2',
            employeeName: 'Sarah Smith',
            totalLeads: 30,
            activeLeads: 18,
            completedLeads: 12,
            conversionRate: 40
          },
        ])
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error('Error fetching distribution:', error)
      setLoading(false)
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full max-w-full min-w-0">
        <div className="px-4 lg:px-6 w-full max-w-full min-w-0">
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight">Lead Distribution</h2>
            <p className="text-muted-foreground">
              View how leads are distributed across your team
            </p>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {distributions.reduce((sum, d) => sum + d.totalLeads, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {distributions.reduce((sum, d) => sum + d.activeLeads, 0)}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Conversion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {distributions.length > 0
                    ? Math.round(distributions.reduce((sum, d) => sum + d.conversionRate, 0) / distributions.length)
                    : 0}%
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{distributions.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribution by Employee</CardTitle>
              <CardDescription>
                Breakdown of leads assigned to each team member
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="table-responsive-wrapper">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                      <TableHead><Skeleton className="h-4 w-24" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                </div>
              ) : (
                <div className="table-responsive-wrapper">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Total Leads</TableHead>
                      <TableHead>Active</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Conversion Rate</TableHead>
                      <TableHead>Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No distribution data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      distributions.map((dist) => (
                        <TableRow key={dist.employeeId}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {dist.employeeName[0].toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{dist.employeeName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{dist.totalLeads}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{dist.activeLeads}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">{dist.completedLeads}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4 text-muted-foreground" />
                              <span>{dist.conversionRate}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="w-full bg-muted rounded-full h-2 max-w-[100px]">
                              <div
                                className="bg-primary h-2 rounded-full"
                                style={{ width: `${dist.conversionRate}%` }}
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
