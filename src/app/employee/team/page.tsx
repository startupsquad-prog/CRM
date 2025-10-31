"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Users, Mail, Phone } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LeadsViewToggle } from "@/components/leads-table/leads-view-toggle"
import { DataTableExportMenu } from "@/components/leads-table/leads-export-menu"

interface TeamMember {
  id: string
  full_name: string | null
  email: string
  role: 'admin' | 'employee'
  phone: string | null
  avatar_url: string | null
  is_active: boolean
}

type TeamFilter = "all" | "admin" | "employee" | "active" | "inactive"

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [primaryFilter, setPrimaryFilter] = useState<TeamFilter>("all")
  const [view, setView] = useState<"kanban" | "table">("kanban")

  useEffect(() => {
    fetchTeam()
  }, [])

  const fetchTeam = async () => {
    try {
      const response = await fetch('/api/employees')
      if (response.ok) {
        const data = await response.json()
        setMembers(data.employees || [])
      }
    } catch (error) {
      console.error('Error fetching team:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredMembers = useMemo(() => {
    let result = members

    if (primaryFilter !== "all") {
      if (primaryFilter === "admin" || primaryFilter === "employee") {
        result = result.filter(m => m.role === primaryFilter)
      } else if (primaryFilter === "active") {
        result = result.filter(m => m.is_active)
      } else if (primaryFilter === "inactive") {
        result = result.filter(m => !m.is_active)
      }
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(member =>
        member.full_name?.toLowerCase().includes(query) ||
        member.email.toLowerCase().includes(query)
      )
    }

    return result
  }, [members, primaryFilter, searchQuery])

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return email[0].toUpperCase()
  }

  const getFilterCount = (filter: TeamFilter) => {
    if (filter === "all") return members.length
    if (filter === "admin") return members.filter(m => m.role === 'admin').length
    if (filter === "employee") return members.filter(m => m.role === 'employee').length
    if (filter === "active") return members.filter(m => m.is_active).length
    if (filter === "inactive") return members.filter(m => !m.is_active).length
    return 0
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden w-full max-w-full">
      <div className="flex flex-col gap-3 px-4 lg:px-6 flex-1 min-h-0 overflow-hidden py-3 w-full max-w-full min-w-0">
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-tight">Team</h2>
          <p className="text-muted-foreground">
            View and connect with your team members
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : members.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : members.filter(m => m.role === 'admin').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : members.filter(m => m.role === 'employee').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : members.filter(m => m.is_active).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Section */}
        <div className="flex-1 min-h-0 flex flex-col w-full max-w-full min-w-0">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-shrink-0 space-y-3">
              {/* Filter Tabs */}
              <div className="flex flex-col gap-3 sticky top-0 z-10 bg-background pb-2 border-b">
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  <Tabs value={primaryFilter} onValueChange={(value) => setPrimaryFilter(value as TeamFilter)} className="w-full">
                    <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent min-w-0">
                      <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        All Members
                        {getFilterCount("all") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("all")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="admin" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Admins
                        {getFilterCount("admin") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("admin")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="employee" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Employees
                        {getFilterCount("employee") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("employee")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="active" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Active
                        {getFilterCount("active") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("active")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="inactive" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Inactive
                        {getFilterCount("inactive") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("inactive")}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full">
                  <div className="flex flex-1 items-center gap-2 min-w-0">
                    <Input
                      placeholder="Search team members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 w-full sm:w-[250px] min-w-[150px] flex-shrink-0"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 border-l pl-2 ml-2">
                    <LeadsViewToggle view={view} onViewChange={setView} />
                    {view === "kanban" && (
                      <DataTableExportMenu data={filteredMembers as any} filename="team" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Team Grid */}
            <div className="flex-1 min-h-0 overflow-auto">
              {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-6 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : view === "kanban" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredMembers.length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No team members found
                      </CardContent>
                    </Card>
                  ) : (
                    filteredMembers.map((member) => (
                      <Card key={member.id} className="hover:shadow-md transition-shadow">
                        <CardHeader>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.avatar_url || undefined} />
                              <AvatarFallback>
                                {getInitials(member.full_name, member.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base truncate">
                                {member.full_name || member.email}
                              </CardTitle>
                              <div className="flex items-center gap-1 truncate pt-1">
                                <Mail className="h-3 w-3" />
                                <span className="text-xs text-muted-foreground truncate">{member.email}</span>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {member.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{member.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between">
                              <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                                {member.role}
                              </Badge>
                              <Badge variant={member.is_active ? 'default' : 'outline'}>
                                {member.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <Button variant="outline" className="w-full">
                              View Profile
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              ) : (
                <div className="flex-1 min-h-0 rounded-md border overflow-hidden">
                  <div className="p-4 text-center text-muted-foreground">
                    Table view coming soon
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}