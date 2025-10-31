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
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTablePagination } from "./data-table-pagination"
import { DataTableKanban } from "./data-table-kanban"
import { DataTableList } from "./data-table-list"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pageCount: number
  onPaginationChange: (page: number, pageSize: number) => void
  onSortingChange: (sorting: SortingState) => void
  onFilterChange: (filters: ColumnFiltersState) => void
  onSearchChange: (search: string) => void
  loading?: boolean
  initialLoading?: boolean
  view?: string
  onViewChange?: (view: string) => void
  onAddUser?: () => void
  onEditUser?: (user: TData) => void
  onDeleteUser?: (user: TData) => void
  onViewUser?: (user: TData) => void
  onDateRangeChange?: (dateRange: { from: Date | undefined; to: Date | undefined }) => void
  onRoleChange?: (userId: string, newRole: string) => void
  searchPlaceholder?: string
  addButtonText?: string
  addButtonIcon?: React.ReactNode
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  onPaginationChange,
  onSortingChange,
  onFilterChange,
  onSearchChange,
  loading = false,
  initialLoading = false,
  view = "table",
  onViewChange,
  onAddUser,
  onEditUser,
  onDeleteUser,
  onViewUser,
  onDateRangeChange,
  onRoleChange,
  searchPlaceholder,
  addButtonText,
  addButtonIcon,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })

  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    onSortingChange: (updater) => {
      setSorting(updater)
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater
      onSortingChange(newSorting)
    },
    onColumnFiltersChange: (updater) => {
      setColumnFilters(updater)
      const newFilters = typeof updater === 'function' ? updater(columnFilters) : updater
      onFilterChange(newFilters)
    },
    onPaginationChange: (updater) => {
      setPagination(updater)
      const newPagination = typeof updater === 'function' ? updater(pagination) : updater
      onPaginationChange(newPagination.pageIndex + 1, newPagination.pageSize)
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  })

  const renderView = () => {
    if (initialLoading) {
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
        <div className="flex-1 overflow-hidden rounded-md border max-h-[calc(100vh-400px)]">
          <DataTableKanban
            data={data as any[]}
            onEdit={onEditUser as any}
            onDelete={onDeleteUser as any}
            onView={onViewUser as any}
            onRoleChange={onRoleChange}
          />
        </div>
      )
    }

    if (view === "list") {
      return (
        <div className="flex-1 overflow-hidden rounded-md border max-h-[calc(100vh-400px)]">
          <DataTableList
            data={data as any[]}
            onEdit={onEditUser as any}
            onDelete={onDeleteUser as any}
            onView={onViewUser as any}
          />
        </div>
      )
    }

    // Default table view
    return (
      <div className="flex-1 overflow-auto rounded-md border max-h-[calc(100vh-400px)]">
        <Table>
          <TableHeader>
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
                  className="text-sm"
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
    )
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <DataTableToolbar
        table={table}
        onSearchChange={onSearchChange}
        view={view}
        onViewChange={onViewChange}
        data={data}
        onAddUser={onAddUser}
        onDateRangeChange={onDateRangeChange}
        searchPlaceholder={searchPlaceholder}
        addButtonText={addButtonText}
        addButtonIcon={addButtonIcon}
      />
      {renderView()}
      {view === "table" && (
        <div className="sticky bottom-0 bg-background border-t">
          <DataTablePagination table={table} />
        </div>
      )}
    </div>
  )
}
