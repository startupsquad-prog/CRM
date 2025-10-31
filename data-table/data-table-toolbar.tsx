"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { DataTableViewToggle } from "./data-table-view-toggle"
import { DataTableExportMenu } from "./data-table-export-menu"
import { DataTableDateRangePicker } from "./data-table-date-range-picker"
import { X, UserPlus } from "lucide-react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onSearchChange: (value: string) => void
  view?: string
  onViewChange?: (view: string) => void
  data?: TData[]
  onAddUser?: () => void
  onDateRangeChange?: (dateRange: { from: Date | undefined; to: Date | undefined }) => void
  searchPlaceholder?: string
  addButtonText?: string
  addButtonIcon?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  onSearchChange,
  view = "table",
  onViewChange,
  data = [],
  onAddUser,
  onDateRangeChange,
  searchPlaceholder = "Search...",
  addButtonText = "Add Item",
  addButtonIcon = <UserPlus className="mr-2 h-4 w-4" />,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-1 items-center gap-2">
        <Input
          placeholder={searchPlaceholder}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 w-[250px]"
        />
        {table.getAllColumns().some(col => col.id === "role_id") && (
          <DataTableFacetedFilter
            column={table.getColumn("role_id")}
            title="Role"
            options={[
              { label: "Client", value: "client" },
              { label: "Admin", value: "admin" },
              { label: "Owner", value: "owner" },
            ]}
          />
        )}
        {table.getAllColumns().some(col => col.id === "plan") && (
          <DataTableFacetedFilter
            column={table.getColumn("plan")}
            title="Plan"
            options={[
              { label: "Free", value: "free" },
              { label: "Pro", value: "pro" },
              { label: "Enterprise", value: "enterprise" },
            ]}
          />
        )}
        {table.getAllColumns().some(col => col.id === "status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={[
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
              { label: "Enabled", value: "enabled" },
              { label: "Disabled", value: "disabled" },
            ]}
          />
        )}
        {table.getAllColumns().some(col => col.id === "trigger_type") && (
          <DataTableFacetedFilter
            column={table.getColumn("trigger_type")}
            title="Type"
            options={[
              { label: "Welcome", value: "welcome" },
              { label: "Password Reset", value: "password_reset" },
              { label: "Notification", value: "notification" },
              { label: "Marketing", value: "marketing" },
            ]}
          />
        )}
        {table.getAllColumns().some(col => col.id === "category") && (
          <DataTableFacetedFilter
            column={table.getColumn("category")}
            title="Category"
            options={[
              { label: "Transactional", value: "transactional" },
              { label: "Marketing", value: "marketing" },
              { label: "Notification", value: "notification" },
              { label: "System", value: "system" },
            ]}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
        {onDateRangeChange && (
          <DataTableDateRangePicker onDateRangeChange={onDateRangeChange} />
        )}
      </div>
      <div className="flex items-center gap-2">
        {onViewChange && (
          <DataTableViewToggle view={view} onViewChange={onViewChange} />
        )}
        <DataTableViewOptions table={table} />
        <DataTableExportMenu data={data} />
        {onAddUser && (
          <Button onClick={onAddUser} size="sm">
            {addButtonIcon}
            {addButtonText}
          </Button>
        )}
      </div>
    </div>
  )
}
