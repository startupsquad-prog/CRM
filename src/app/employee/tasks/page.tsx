"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react"
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

interface Task {
  id: string
  title: string
  description: string | null
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate: string | null
  assignedTo: string | null
}

type TaskFilter = "all" | "todo" | "in_progress" | "completed"

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Follow up with Lead - John Doe',
    description: 'Call to discuss product requirements',
    status: 'todo',
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    assignedTo: 'You'
  },
  {
    id: '2',
    title: 'Prepare Quotation for ABC Corp',
    description: 'Create detailed quotation with pricing',
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    assignedTo: 'You'
  },
  {
    id: '3',
    title: 'Update CRM Records',
    description: 'Review and update lead information',
    status: 'completed',
    priority: 'medium',
    dueDate: new Date(Date.now() - 86400000).toISOString(),
    assignedTo: 'You'
  },
]

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'destructive'
    case 'medium':
      return 'default'
    case 'low':
      return 'secondary'
    default:
      return 'outline'
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState(sampleTasks)
  const [view, setView] = useState<"kanban" | "table">("kanban")
  const [searchQuery, setSearchQuery] = useState("")
  const [primaryFilter, setPrimaryFilter] = useState<TaskFilter>("all")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const filteredTasks = useMemo(() => {
    let result = tasks

    // Filter by primary filter
    if (primaryFilter !== "all") {
      result = result.filter(t => t.status === primaryFilter)
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
      )
    }

    // Filter by date range
    if (dateRange.from || dateRange.to) {
      result = result.filter(task => {
        if (!task.dueDate) return true
        const taskDate = new Date(task.dueDate)
        if (dateRange.from && taskDate < dateRange.from) return false
        if (dateRange.to && taskDate > dateRange.to) return false
        return true
      })
    }

    return result
  }, [tasks, primaryFilter, searchQuery, dateRange])

  const groupedTasks = useMemo(() => ({
    todo: filteredTasks.filter(t => t.status === 'todo'),
    in_progress: filteredTasks.filter(t => t.status === 'in_progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
  }), [filteredTasks])

  const columns: ColumnDef<Task>[] = useMemo(() => [
    {
      accessorKey: "title",
      header: "Task",
      cell: ({ row }) => {
        const task = row.original
        return (
          <div className="flex items-center gap-2">
            {task.status === 'completed' ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <Circle className="h-4 w-4 text-muted-foreground" />
            )}
            <div className="flex flex-col">
              <span className="font-medium">{task.title}</span>
              {task.description && (
                <span className="text-xs text-muted-foreground">{task.description}</span>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => {
        const task = row.original
        return (
          <Badge variant={getPriorityColor(task.priority) as any}>
            {task.priority}
          </Badge>
        )
      },
    },
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row }) => {
        const task = row.original
        return task.dueDate ? (
          <div className="flex items-center gap-1 text-sm">
            <AlertCircle className="h-3 w-3 text-muted-foreground" />
            {format(new Date(task.dueDate), 'MMM dd, yyyy')}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const task = row.original
        const statusLabels: Record<string, string> = {
          todo: 'To Do',
          in_progress: 'In Progress',
          completed: 'Completed'
        }
        return (
          <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
            {statusLabels[task.status] || task.status}
          </Badge>
        )
      },
    },
  ], [])

  const table = useReactTable({
    data: filteredTasks,
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

  const getFilterCount = (filter: TaskFilter) => {
    if (filter === "all") return tasks.length
    return tasks.filter(t => t.status === filter).length
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden w-full max-w-full">
      <div className="flex flex-col gap-3 px-4 lg:px-6 flex-1 min-h-0 overflow-hidden py-3 w-full max-w-full min-w-0">
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-tight">My Tasks</h2>
          <p className="text-muted-foreground">
            Manage and track your tasks
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">To Do</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groupedTasks.todo.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groupedTasks.in_progress.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groupedTasks.completed.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Table/Kanban Section */}
        <div className="flex-1 min-h-0 flex flex-col w-full max-w-full min-w-0">
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-shrink-0 space-y-3">
              {/* Filter Tabs */}
              <div className="flex flex-col gap-3 sticky top-0 z-10 bg-background pb-2 border-b">
                <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                  <Tabs value={primaryFilter} onValueChange={(value) => setPrimaryFilter(value as TaskFilter)} className="w-full">
                    <TabsList className="inline-flex h-9 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent min-w-0">
                      <TabsTrigger value="all" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        All Tasks
                        {getFilterCount("all") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("all")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="todo" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        To Do
                        {getFilterCount("todo") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("todo")}
                          </Badge>
                        )}
                      </TabsTrigger>
                      <TabsTrigger value="in_progress" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
                        In Progress
                        {getFilterCount("in_progress") > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {getFilterCount("in_progress")}
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
                    </TabsList>
                  </Tabs>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full">
                  <div className="flex flex-1 items-center gap-2 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    <Input
                      placeholder="Search tasks..."
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
                        <DataTableExportMenu data={filteredTasks as any} filename="tasks" />
                        <Button onClick={() => {}} size="sm" className="flex-shrink-0">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Task
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0">
              {view === "kanban" ? (
                <div className="grid gap-4 md:grid-cols-3 h-full">
                  {['todo', 'in_progress', 'completed'].map((status) => (
                    <Card key={status} className="flex flex-col">
                      <CardHeader>
                        <CardTitle className="text-base capitalize flex items-center gap-2">
                          {status === 'todo' && <Circle className="h-4 w-4" />}
                          {status === 'in_progress' && <Clock className="h-4 w-4" />}
                          {status === 'completed' && <CheckCircle2 className="h-4 w-4" />}
                          {status.replace('_', ' ')}
                          <Badge variant="secondary" className="ml-auto">
                            {groupedTasks[status as keyof typeof groupedTasks].length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 overflow-y-auto">
                        <div className="space-y-3">
                          {groupedTasks[status as keyof typeof groupedTasks].map((task) => (
                            <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-sm">{task.title}</CardTitle>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {task.description}
                                  </p>
                                )}
                              </CardHeader>
                              <CardContent>
                                <div className="flex items-center justify-between">
                                  <Badge variant={getPriorityColor(task.priority) as any} className="text-xs">
                                    {task.priority}
                                  </Badge>
                                  {task.dueDate && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <AlertCircle className="h-3 w-3" />
                                      {format(new Date(task.dueDate), 'MMM dd')}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}