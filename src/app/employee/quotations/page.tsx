"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, FileText, DollarSign } from "lucide-react"
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

interface Quotation {
  id: string
  quote_number: string
  lead_id: string
  total_amount: number
  currency: string
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'
  valid_until: string | null
  created_at: string
}

type QuotationFilter = "all" | "draft" | "sent" | "accepted" | "rejected" | "expired"

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [primaryFilter, setPrimaryFilter] = useState<QuotationFilter>("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [view, setView] = useState<"kanban" | "table">("table")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    try {
      const response = await fetch('/api/quotations')
      if (response.ok) {
        const data = await response.json()
        setQuotations(data.quotations || [])
      }
    } catch (error) {
      console.error('Error fetching quotations:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'default'
      case 'sent':
        return 'secondary'
      case 'draft':
        return 'outline'
      case 'rejected':
      case 'expired':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const filteredQuotations = useMemo(() => {
    let result = quotations

    // Filter by primary filter
    if (primaryFilter !== "all") {
      result = result.filter(q => q.status === primaryFilter)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(quote =>
        quote.quote_number.toLowerCase().includes(query) ||
        quote.status.toLowerCase().includes(query)
      )
    }

    // Filter by date range
    if (dateRange.from || dateRange.to) {
      result = result.filter(quote => {
        const quoteDate = new Date(quote.created_at)
        if (dateRange.from && quoteDate < dateRange.from) return false
        if (dateRange.to && quoteDate > dateRange.to) return false
        return true
      })
    }

    return result
  }, [quotations, primaryFilter, searchQuery, dateRange])

  const columns: ColumnDef<Quotation>[] = useMemo(() => [
    {
      accessorKey: "quote_number",
      header: "Quote Number",
      cell: ({ row }) => {
        const quote = row.original
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{quote.quote_number}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "total_amount",
      header: "Amount",
      cell: ({ row }) => {
        const quote = row.original
        return (
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">
              {formatCurrency(Number(quote.total_amount), quote.currency)}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const quote = row.original
        return (
          <Badge variant={getStatusColor(quote.status) as any}>
            {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "valid_until",
      header: "Valid Until",
      cell: ({ row }) => {
        const quote = row.original
        return quote.valid_until ? (
          format(new Date(quote.valid_until), 'MMM dd, yyyy')
        ) : (
          <span className="text-muted-foreground">—</span>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => {
        const quote = row.original
        return format(new Date(quote.created_at), 'MMM dd, yyyy')
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="text-right">
            <Button variant="ghost" size="sm">
              View
            </Button>
          </div>
        )
      },
    },
  ], [])

  const table = useReactTable({
    data: filteredQuotations,
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

  const getFilterCount = (filter: QuotationFilter) => {
    if (filter === "all") return quotations.length
    return quotations.filter(q => q.status === filter).length
  }

  const totalValue = quotations
    .filter(q => q.status === 'accepted')
    .reduce((sum, q) => sum + Number(q.total_amount), 0)

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden w-full max-w-full">
      <div className="flex flex-col gap-3 px-4 lg:px-6 flex-1 min-h-0 overflow-hidden py-3 w-full max-w-full min-w-0">
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-tight">Quotations</h2>
          <p className="text-muted-foreground">
            Manage your sales quotations and proposals
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quotations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : quotations.length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : quotations.filter(q => q.status === 'accepted').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-24" /> : formatCurrency(totalValue)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="h-8 w-16" /> : quotations.filter(q => q.status === 'sent' || q.status === 'draft').length}
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
                  <Tabs value={primaryFilter} onValueChange={(value) => setPrimaryFilter(value as QuotationFilter)} className="w-full">
                    <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent min-w-0">
                      <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        All Quotations
                        {getFilterCount("all") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("all")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="draft" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Draft
                        {getFilterCount("draft") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("draft")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="sent" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Sent
                        {getFilterCount("sent") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("sent")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="accepted" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Accepted
                        {getFilterCount("accepted") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("accepted")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="rejected" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Rejected
                        {getFilterCount("rejected") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("rejected")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="expired" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Expired
                        {getFilterCount("expired") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("expired")}
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
                      placeholder="Search by quote number or status..."
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
                        <DataTableExportMenu data={filteredQuotations} filename="quotations" />
                        <Button onClick={() => {}} size="sm" className="flex-shrink-0">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Quotation
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