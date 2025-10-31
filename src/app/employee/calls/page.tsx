"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, PhoneIncoming, PhoneOutgoing, Clock } from "lucide-react"
import { format } from "date-fns"
import { DataTableDateRangePicker } from "@/components/leads-table/leads-date-range-picker"
import { LeadsViewToggle } from "@/components/leads-table/leads-view-toggle"
import { LeadsTablePagination } from "@/components/leads-table/leads-table-pagination"
import { DataTableExportMenu } from "@/components/leads-table/leads-export-menu"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table"

interface Call {
  id: string
  lead_id: string | null
  call_type: 'inbound' | 'outbound'
  duration: number | null
  outcome: string | null
  notes: string | null
  scheduled_at: string | null
  completed_at: string | null
  created_at: string
}

type CallFilter = "all" | "inbound" | "outbound" | "completed" | "scheduled" | "pending"

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [primaryFilter, setPrimaryFilter] = useState<CallFilter>("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [view, setView] = useState<"kanban" | "table">("table")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  useEffect(() => {
    fetchCalls()
  }, [])

  const fetchCalls = async () => {
    try {
      const response = await fetch('/api/calls')
      if (response.ok) {
        const data = await response.json()
        setCalls(data.calls || [])
      }
    } catch (error) {
      console.error('Error fetching calls:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '—'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const filteredCalls = useMemo(() => {
    let result = calls

    // Filter by primary filter
    if (primaryFilter !== "all") {
      if (primaryFilter === "inbound" || primaryFilter === "outbound") {
        result = result.filter(c => c.call_type === primaryFilter)
      } else if (primaryFilter === "completed") {
        result = result.filter(c => c.completed_at !== null)
      } else if (primaryFilter === "scheduled") {
        result = result.filter(c => c.scheduled_at !== null && !c.completed_at)
      } else if (primaryFilter === "pending") {
        result = result.filter(c => !c.completed_at && !c.scheduled_at)
      }
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(call =>
        call.outcome?.toLowerCase().includes(query) ||
        call.notes?.toLowerCase().includes(query)
      )
    }

    // Filter by date range
    if (dateRange.from || dateRange.to) {
      result = result.filter(call => {
        const callDate = call.completed_at
          ? new Date(call.completed_at)
          : call.scheduled_at
          ? new Date(call.scheduled_at)
          : new Date(call.created_at)
        
        if (dateRange.from && callDate < dateRange.from) return false
        if (dateRange.to && callDate > dateRange.to) return false
        return true
      })
    }

    return result
  }, [calls, primaryFilter, searchQuery, dateRange])

  const columns: ColumnDef<Call>[] = useMemo(() => [
    {
      accessorKey: "call_type",
      header: "Type",
      cell: ({ row }) => {
        const call = row.original
        return (
          <Badge variant={call.call_type === 'inbound' ? 'default' : 'secondary'} className="gap-1">
            {call.call_type === 'inbound' ? (
              <PhoneIncoming className="h-3 w-3" />
            ) : (
              <PhoneOutgoing className="h-3 w-3" />
            )}
            {call.call_type}
          </Badge>
        )
      },
    },
    {
      accessorKey: "date_time",
      header: "Date & Time",
      cell: ({ row }) => {
        const call = row.original
        const date = call.completed_at
          ? new Date(call.completed_at)
          : call.scheduled_at
          ? new Date(call.scheduled_at)
          : new Date(call.created_at)
        return (
          <div className="flex flex-col">
            <span className="text-sm">{format(date, 'MMM dd, yyyy')}</span>
            <span className="text-xs text-muted-foreground">{format(date, 'hh:mm a')}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ row }) => {
        const call = row.original
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{formatDuration(call.duration)}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "outcome",
      header: "Outcome",
      cell: ({ row }) => {
        const call = row.original
        return call.outcome ? (
          <Badge variant="outline">{call.outcome}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )
      },
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => {
        const call = row.original
        return (
          <span className="text-sm">
            {call.notes ? (
              call.notes.length > 50 ? `${call.notes.substring(0, 50)}...` : call.notes
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const call = row.original
        return call.completed_at ? (
          <Badge variant="default">Completed</Badge>
        ) : call.scheduled_at ? (
          <Badge variant="secondary">Scheduled</Badge>
        ) : (
          <Badge variant="outline">Pending</Badge>
        )
      },
    },
  ], [])

  const table = useReactTable({
    data: filteredCalls,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const getFilterCount = (filter: CallFilter) => {
    if (filter === "all") return calls.length
    if (filter === "inbound") return calls.filter(c => c.call_type === 'inbound').length
    if (filter === "outbound") return calls.filter(c => c.call_type === 'outbound').length
    if (filter === "completed") return calls.filter(c => c.completed_at !== null).length
    if (filter === "scheduled") return calls.filter(c => c.scheduled_at !== null && !c.completed_at).length
    if (filter === "pending") return calls.filter(c => !c.completed_at && !c.scheduled_at).length
    return 0
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden w-full max-w-full">
      <div className="flex flex-col gap-3 px-4 lg:px-6 flex-1 min-h-0 overflow-hidden py-3 w-full max-w-full min-w-0">
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-tight">My Calls</h2>
          <p className="text-muted-foreground">
            Track and manage your call activities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : calls.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inbound</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : calls.filter(c => c.call_type === 'inbound').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outbound</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : calls.filter(c => c.call_type === 'outbound').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : calls.filter(c => {
                  const callDate = new Date(c.created_at)
                  const now = new Date()
                  return callDate.getMonth() === now.getMonth() &&
                         callDate.getFullYear() === now.getFullYear()
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Section */}
        <div className="flex-1 min-h-0 flex flex-col w-full max-w-full min-w-0">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-shrink-0 space-y-3">
              {/* Filter Tabs */}
              <div className="flex flex-col gap-3 sticky top-0 z-10 bg-background pb-2 border-b">
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  <Tabs value={primaryFilter} onValueChange={(value) => setPrimaryFilter(value as CallFilter)} className="w-full">
                    <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent min-w-0">
                      <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        All Calls
                        {getFilterCount("all") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("all")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="inbound" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Inbound
                        {getFilterCount("inbound") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("inbound")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="outbound" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Outbound
                        {getFilterCount("outbound") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("outbound")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="completed" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Completed
                        {getFilterCount("completed") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("completed")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="scheduled" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Scheduled
                        {getFilterCount("scheduled") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("scheduled")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="pending" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Pending
                        {getFilterCount("pending") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("pending")}
                          </Badge>
                        )}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full">
                  <div className="flex flex-1 items-center gap-2 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <Input
                      placeholder="Search by outcome or notes..."
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 w-full sm:w-[250px] min-w-[150px] flex-shrink-0"
                    />
                    <div className="flex items-center gap-2 flex-nowrap min-w-0">
                      <div className="flex-shrink-0">
                        <DataTableDateRangePicker onDateRangeChange={setDateRange} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 border-l pl-2 ml-2">
                    <LeadsViewToggle view={view} onViewChange={setView} />
                    {view === "table" && (
                      <>
                        <DataTableExportMenu data={filteredCalls as any} filename="calls" />
                        <Button onClick={() => {}} size="sm" className="flex-shrink-0">
                          <Plus className="mr-2 h-4 w-4" />
                          Log Call
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 min-h-0">
              {loading ? (
                <div className="flex-1 min-h-0 rounded-md border flex flex-col bg-background overflow-hidden">
                  <div className="flex-1 min-h-0 overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10 border-b">
                        {Array.from({ length: 1 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 6 }).map((_, j) => (
                              <TableHead key={j}>
                                <Skeleton className="h-4 w-20" />
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <TableRow key={i}>
                            {Array.from({ length: 6 }).map((_, j) => (
                              <TableCell key={j}>
                                <Skeleton className="h-4 w-full" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : view === "table" ? (
                <div className="flex-1 min-h-0 rounded-md border flex flex-col bg-background overflow-hidden">
                  <div className="flex-1 min-h-0 overflow-auto">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background z-10 border-b">
                        {table.getHeaderGroups().map((headerGroup) => (
                          <TableRow key={headerGroup.id} className="text-sm">
                            {headerGroup.headers.map((header) => (
                              <TableHead key={header.id} className="py-2 px-3">
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(
                                      header.column.columnDef.header,
                                      header.getContext()
                                    )}
                              </TableHead>
                            ))}
                          </TableRow>
                        ))}
                      </TableHeader>
                      <TableBody>
                        {table.getRowModel().rows?.length ? (
                          table.getRowModel().rows.map((row) => (
                            <TableRow
                              key={row.id}
                              className="text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                            >
                              {row.getVisibleCells().map((cell) => (
                                <TableCell key={cell.id} className="py-2 px-3">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                              No results.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex-shrink-0 border-t bg-background">
                    <LeadsTablePagination table={table} />
                  </div>
                </div>
              ) : (
                <div className="flex-1 min-h-0 rounded-md border overflow-hidden">
                  <div className="p-4 text-center text-muted-foreground">
                    Kanban view coming soon
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
