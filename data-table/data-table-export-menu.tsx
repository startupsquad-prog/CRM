"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileDown } from "lucide-react"
import { toast } from "sonner"

interface DataTableExportMenuProps {
  data: any[]
  filename?: string
}

export function DataTableExportMenu({ data, filename = "users" }: DataTableExportMenuProps) {
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error("No data to export")
      return
    }

    try {
      // Get headers from the first row
      const headers = Object.keys(data[0])
      
      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header]
            // Escape commas and quotes in CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          }).join(",")
        )
      ].join("\n")

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast.success("CSV exported successfully!")
    } catch (error) {
      toast.error("Failed to export CSV")
      console.error("Export error:", error)
    }
  }

  const exportToPDF = () => {
    // TODO: Implement PDF export functionality
    // This would require a library like jsPDF or similar
    toast.info("PDF export functionality will be implemented soon")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV}>
          <FileText className="mr-2 h-4 w-4" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileDown className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
