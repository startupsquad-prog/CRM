"use client"

import { LayoutGrid, List, Table } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface DataTableViewToggleProps {
  view: string
  onViewChange: (view: string) => void
}

export function DataTableViewToggle({ view, onViewChange }: DataTableViewToggleProps) {
  return (
    <ToggleGroup type="single" variant="outline" value={view} onValueChange={onViewChange}>
      <ToggleGroupItem value="table" aria-label="Table view">
        <Table className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="list" aria-label="List view">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="kanban" aria-label="Kanban view">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
