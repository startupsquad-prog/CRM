"use client"

import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { LeadsViewToggle } from "./leads-view-toggle"
import { LeadsFilterTabs, type PrimaryFilter } from "./leads-filter-tabs"
import { DataTableFacetedFilter } from "@/components/ui/data-table-faceted-filter"
import { DataTableExportMenu } from "./leads-export-menu"
import { DataTableDateRangePicker } from "./leads-date-range-picker"
import { DataTableViewOptions } from "./leads-view-options"
import { Lead } from "@/types/lead"

interface LeadsTableToolbarProps {
  table: Table<Lead>
  onSearchChange: (value: string) => void
  view: "kanban" | "table"
  onViewChange: (view: "kanban" | "table") => void
  data?: Lead[]
  onAddLead?: () => void
  onDateRangeChange?: (dateRange: { from: Date | undefined; to: Date | undefined }) => void
  primaryFilter: PrimaryFilter
  onPrimaryFilterChange: (filter: PrimaryFilter) => void
  searchPlaceholder?: string
  addButtonText?: string
}

// Source options
const sourceOptions = [
  { label: "Website", value: "website" },
  { label: "Inbound Call", value: "inbound-call" },
  { label: "Referral", value: "referral" },
  { label: "Email", value: "email" },
  { label: "Social Media", value: "social" },
  { label: "Trade Show", value: "trade-show" },
  { label: "Other", value: "other" },
]

// Product inquiry options
const productOptions = [
  { label: "Premium Massager Chair", value: "Premium Massager Chair ( Trending🔥)" },
  { label: "3D Printer", value: "3d Printer" },
  { label: "Action Figurines", value: "Action Figurines" },
]

// Priority options (Hot/Warm/Cold for lead classification)
const priorityOptions = [
  { label: "Hot Lead", value: "Hot Lead" },
  { label: "Warm Lead", value: "Warm Lead" },
  { label: "Cold Lead", value: "Cold Lead" },
]

// Tag options (Additional labels)
const tagOptions = [
  { label: "Follow-up Required", value: "Follow-up Required" },
  { label: "Price Sensitive", value: "Price Sensitive" },
  { label: "Bulk Order", value: "Bulk Order" },
  { label: "Corporate", value: "Corporate" },
  { label: "Retail", value: "Retail" },
]

// Rating options (1-5 stars)
const ratingOptions = [
  { label: "5 Stars", value: "5" },
  { label: "4 Stars", value: "4" },
  { label: "3 Stars", value: "3" },
  { label: "2 Stars", value: "2" },
  { label: "1 Star", value: "1" },
  { label: "No Rating", value: "null" },
]

export function LeadsTableToolbar({
  table,
  onSearchChange,
  view,
  onViewChange,
  data = [],
  onAddLead,
  onDateRangeChange,
  primaryFilter,
  onPrimaryFilterChange,
  searchPlaceholder = "Search leads...",
  addButtonText = "Add Lead",
}: LeadsTableToolbarProps) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col gap-3 sticky top-0 z-10 bg-background pb-2 border-b">
      {/* Primary Filters - Tabs with horizontal scroll - Hide in kanban view */}
      {view === "table" && (
        <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <LeadsFilterTabs
            activeFilter={primaryFilter}
            onFilterChange={onPrimaryFilterChange}
          />
        </div>
      )}

      {/* Toolbar Row - Responsive with proper wrapping */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full">
        {/* Left side - Search and Filters */}
        <div className="flex flex-1 items-center gap-2 min-w-0 overflow-x-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <Input
            placeholder={searchPlaceholder}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-8 w-full sm:w-[250px] min-w-[150px] flex-shrink-0"
          />
          
          {/* Secondary Filters - Horizontal scrollable container */}
          <div className="flex items-center gap-2 flex-nowrap min-w-0">
            {table.getColumn("source") && (
              <div className="flex-shrink-0">
                <DataTableFacetedFilter
                  column={table.getColumn("source")}
                  title="Source"
                  options={sourceOptions}
                />
              </div>
            )}
            {table.getColumn("product_inquiry") && (
              <div className="flex-shrink-0">
                <DataTableFacetedFilter
                  column={table.getColumn("product_inquiry")}
                  title="Product"
                  options={productOptions}
                />
              </div>
            )}
            {table.getColumn("tags") && (
              <>
                <div className="flex-shrink-0">
                  <DataTableFacetedFilter
                    column={table.getColumn("tags")}
                    title="Priority"
                    options={priorityOptions}
                  />
                </div>
                <div className="flex-shrink-0">
                  <DataTableFacetedFilter
                    column={table.getColumn("tags")}
                    title="Tags"
                    options={tagOptions}
                  />
                </div>
              </>
            )}
            {table.getColumn("rating") && (
              <div className="flex-shrink-0">
                <DataTableFacetedFilter
                  column={table.getColumn("rating")}
                  title="Rating"
                  options={ratingOptions}
                />
              </div>
            )}
            
            {isFiltered && (
              <Button
                variant="ghost"
                onClick={() => table.resetColumnFilters()}
                className="h-8 px-2 flex-shrink-0"
              >
                Reset
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
            
            {onDateRangeChange && (
              <div className="flex-shrink-0">
                <DataTableDateRangePicker onDateRangeChange={onDateRangeChange} />
              </div>
            )}
          </div>
        </div>
        
        {/* Right side - Actions - Always visible */}
        <div className="flex items-center gap-2 flex-shrink-0 border-l pl-2 ml-2">
          <LeadsViewToggle view={view} onViewChange={onViewChange} />
          {view === "table" && <DataTableViewOptions table={table} />}
          <DataTableExportMenu data={data} filename="leads" />
          {onAddLead && (
            <Button onClick={onAddLead} size="sm" className="flex-shrink-0">
              {addButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

