"use client"

import { useState } from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  VisibilityState,
  ColumnFiltersState,
  RowSelectionState,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Lead } from "@/types/lead"
import { LeadsTableToolbar } from "./leads-table-toolbar"
import { LeadsTablePagination } from "./leads-table-pagination"
import { LeadsKanban } from "./leads-kanban"
import { PrimaryFilter } from "./leads-filter-tabs"

interface LeadsTableProps {
  columns: ColumnDef<Lead>[]
  data: Lead[]
  loading?: boolean
  initialLoading?: boolean
  view?: "kanban" | "table"
  onViewChange?: (view: "kanban" | "table") => void
  onAddLead?: () => void
  onEditLead?: (lead: Lead) => void
  onDeleteLead?: (lead: Lead) => void
  onViewLead?: (lead: Lead) => void
  onDateRangeChange?: (dateRange: { from: Date | undefined; to: Date | undefined }) => void
  onSearchChange?: (search: string) => void
  primaryFilter?: PrimaryFilter
  onPrimaryFilterChange?: (filter: PrimaryFilter) => void
  searchPlaceholder?: string
  addButtonText?: string
}

export function LeadsTable({
  columns,
  data,
  loading = false,
  initialLoading = false,
  view = "kanban",
  onViewChange,
  onAddLead,
  onEditLead,
  onDeleteLead,
  onViewLead,
  onDateRangeChange,
  onSearchChange,
  primaryFilter = "all",
  onPrimaryFilterChange,
  searchPlaceholder = "Search leads...",
  addButtonText = "Add Lead",
}: LeadsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })

  const renderView = () => {
    if (initialLoading || loading) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (view === "kanban") {
      return (
        <div className="flex-1 min-h-0 rounded-md border overflow-hidden">
          <LeadsKanban
            data={data}
            onEdit={onEditLead}
            onDelete={onDeleteLead}
            onView={onViewLead}
          />
        </div>
      )
    }

    // Table view
    return (
      <div className="flex-1 min-h-0 rounded-md border flex flex-col bg-background overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10 border-b">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="text-sm">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="py-2 px-3">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="text-sm cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onViewLead?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-2 px-3" onClick={(e) => {
                        // Prevent triggering row click for interactive elements
                        const target = e.target as HTMLElement
                        if (target.closest('button') || target.closest('a') || target.closest('[role="button"]')) {
                          e.stopPropagation()
                        }
                      }}>
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
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0 space-y-3">
        <LeadsTableToolbar
          table={table}
          onSearchChange={onSearchChange || (() => {})}
          view={view}
          onViewChange={onViewChange || (() => {})}
          data={data}
          onAddLead={onAddLead}
          onDateRangeChange={onDateRangeChange}
          primaryFilter={primaryFilter}
          onPrimaryFilterChange={onPrimaryFilterChange || (() => {})}
          searchPlaceholder={searchPlaceholder}
          addButtonText={addButtonText}
        />
      </div>
      <div className="flex-1 min-h-0">
        {renderView()}
      </div>
      {view === "table" && (
        <div className="flex-shrink-0 border-t bg-background mt-3">
          <LeadsTablePagination table={table} />
        </div>
      )}
    </div>
  )
}

