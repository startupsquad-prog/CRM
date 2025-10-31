"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { X } from "lucide-react"

type FilterOption = {
  value: string
  label: string
}

const statusFilters: FilterOption[] = [
  { value: "all", label: "All Leads" },
  { value: "hot", label: "Hot Leads" },
  { value: "warm", label: "Warm Leads" },
  { value: "cold", label: "Cold Leads" },
  { value: "follow-up", label: "Follow-ups Today" },
  { value: "assigned", label: "My Assigned" },
]

const sourceFilters: FilterOption[] = [
  { value: "website", label: "Website" },
  { value: "referral", label: "Referral" },
  { value: "cold-call", label: "Cold Call" },
  { value: "email", label: "Email Campaign" },
  { value: "social", label: "Social Media" },
  { value: "trade-show", label: "Trade Show" },
  { value: "other", label: "Other" },
]

const dateRangeFilters: FilterOption[] = [
  { value: "today", label: "Today" },
  { value: "this-week", label: "This Week" },
  { value: "this-month", label: "This Month" },
  { value: "last-month", label: "Last Month" },
  { value: "custom", label: "Custom Range" },
]

export function LeadFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const status = searchParams.get("status") || "all"
  const sources = searchParams.getAll("source")
  const dateRange = searchParams.get("dateRange") || ""
  const assignedTo = searchParams.get("assignedTo") || "me"

  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (status !== "all") count++
    if (sources.length > 0) count++
    if (dateRange) count++
    if (assignedTo !== "me") count++
    return count
  }, [status, sources, dateRange, assignedTo])

  const updateParams = React.useCallback((updates: Record<string, string | string[]>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        params.delete(key)
        value.forEach(v => params.append(key, v))
      } else if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, searchParams])

  const handleStatusChange = (value: string) => {
    updateParams({ status: value })
  }

  const handleSourceToggle = (value: string, checked: boolean) => {
    const current = sources
    const updated = checked
      ? [...current, value]
      : current.filter(s => s !== value)
    updateParams({ source: updated })
  }

  const handleDateRangeChange = (value: string) => {
    updateParams({ dateRange: value })
  }

  const handleAssignedToChange = (value: string) => {
    updateParams({ assignedTo: value })
  }

  const clearFilters = () => {
    router.push(pathname)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        {statusFilters.map((filter) => (
          <DropdownMenuCheckboxItem
            key={filter.value}
            checked={status === filter.value}
            onCheckedChange={() => handleStatusChange(filter.value)}
          >
            {filter.label}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Source</DropdownMenuLabel>
        {sourceFilters.map((filter) => (
          <DropdownMenuCheckboxItem
            key={filter.value}
            checked={sources.includes(filter.value)}
            onCheckedChange={(checked) => handleSourceToggle(filter.value, checked)}
          >
            {filter.label}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Date Range</DropdownMenuLabel>
        {dateRangeFilters.map((filter) => (
          <DropdownMenuCheckboxItem
            key={filter.value}
            checked={dateRange === filter.value}
            onCheckedChange={() => handleDateRangeChange(filter.value)}
          >
            {filter.label}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Assigned To</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={assignedTo === "me"}
          onCheckedChange={() => handleAssignedToChange("me")}
        >
          Me
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={assignedTo === "unassigned"}
          onCheckedChange={() => handleAssignedToChange("unassigned")}
        >
          Unassigned
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={assignedTo === "all"}
          onCheckedChange={() => handleAssignedToChange("all")}
        >
          All Team
        </DropdownMenuCheckboxItem>
        
        {activeFiltersCount > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={false}
              onCheckedChange={clearFilters}
              className="text-destructive focus:text-destructive"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </DropdownMenuCheckboxItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

