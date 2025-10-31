"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, MessageSquare, Copy, Edit, Trash2 } from "lucide-react"
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

interface Template {
  id: string
  name: string
  category: string
  subject: string
  content: string
  variables: string[]
  created_at: string
}

type TemplateFilter = "all" | "Email" | "Call" | "SMS"

const templates: Template[] = [
  {
    id: '1',
    name: 'Welcome Email',
    category: 'Email',
    subject: 'Welcome to {{company_name}}!',
    content: 'Dear {{lead_name}}, welcome! We are excited to have you on board...',
    variables: ['lead_name', 'company_name'],
    created_at: '2024-01-15'
  },
  {
    id: '2',
    name: 'Follow-up Call',
    category: 'Call',
    content: 'Hi {{lead_name}}, this is {{your_name}} from {{company_name}}. I wanted to follow up on...',
    subject: '',
    variables: ['lead_name', 'your_name', 'company_name'],
    created_at: '2024-01-10'
  },
  {
    id: '3',
    name: 'Quotation Reminder',
    category: 'Email',
    subject: 'Reminder: Your Quotation',
    content: 'Dear {{lead_name}}, we wanted to remind you about the quotation we sent...',
    variables: ['lead_name', 'quote_number'],
    created_at: '2024-01-08'
  },
]

export default function MessagingTemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [primaryFilter, setPrimaryFilter] = useState<TemplateFilter>("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [view, setView] = useState<"kanban" | "table">("table")
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const categories = Array.from(new Set(templates.map(t => t.category)))

  const filteredTemplates = useMemo(() => {
    let result = templates

    if (primaryFilter !== "all") {
      result = result.filter(t => t.category === primaryFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(template =>
        template.name.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query)
      )
    }

    if (dateRange.from || dateRange.to) {
      result = result.filter(template => {
        const templateDate = new Date(template.created_at)
        if (dateRange.from && templateDate < dateRange.from) return false
        if (dateRange.to && templateDate > dateRange.to) return false
        return true
      })
    }

    return result
  }, [primaryFilter, searchQuery, dateRange])

  const columns: ColumnDef<Template>[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "Template Name",
      cell: ({ row }) => {
        const template = row.original
        return (
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{template.name}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => {
        const template = row.original
        return <Badge variant="outline">{template.category}</Badge>
      },
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => {
        const template = row.original
        return (
          <span className="text-sm">
            {template.subject || <span className="text-muted-foreground">—</span>}
          </span>
        )
      },
    },
    {
      accessorKey: "variables",
      header: "Variables",
      cell: ({ row }) => {
        const template = row.original
        return (
          <div className="flex flex-wrap gap-1">
            {template.variables.map((varName, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {`{{${varName}}}`}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ], [])

  const table = useReactTable({
    data: filteredTemplates,
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

  const getFilterCount = (filter: TemplateFilter) => {
    if (filter === "all") return templates.length
    return templates.filter(t => t.category === filter).length
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden w-full max-w-full">
      <div className="flex flex-col gap-3 px-4 lg:px-6 flex-1 min-h-0 overflow-hidden py-3 w-full max-w-full min-w-0">
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-tight">Messaging Templates</h2>
          <p className="text-muted-foreground">
            Create and manage reusable message templates
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{templates.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Email</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {templates.filter(t => t.category === 'Email').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Call</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {templates.filter(t => t.category === 'Call').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SMS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {templates.filter(t => t.category === 'SMS').length}
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
                  <Tabs value={primaryFilter} onValueChange={(value) => setPrimaryFilter(value as TemplateFilter)} className="w-full">
                    <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent min-w-0">
                      <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        All Templates
                        {getFilterCount("all") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("all")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="Email" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Email
                        {getFilterCount("Email") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("Email")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="Call" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        Call
                        {getFilterCount("Call") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("Call")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="SMS" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        SMS
                        {getFilterCount("SMS") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("SMS")}
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
                      placeholder="Search templates..."
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
                        <DataTableExportMenu data={filteredTemplates as any} filename="templates" />
                        <Button onClick={() => {}} size="sm" className="flex-shrink-0">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Template
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 min-h-0">
              {view === "table" ? (
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