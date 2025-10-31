"use client"

import { LayoutGrid, Table } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface LeadsViewToggleProps {
  view: "kanban" | "table"
  onViewChange: (view: "kanban" | "table") => void
}

export function LeadsViewToggle({ view, onViewChange }: LeadsViewToggleProps) {
  return (
    <ToggleGroup type="single" variant="outline" value={view} onValueChange={(value) => {
      if (value && (value === "kanban" || value === "table")) {
        onViewChange(value)
      }
    }}>
      <ToggleGroupItem value="kanban" aria-label="Kanban view">
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Table view">
        <Table className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

