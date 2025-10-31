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
import { Lead } from "@/types/lead"

interface LeadsExportMenuProps {
  data: Lead[]
  filename?: string
}

export function DataTableExportMenu({ data, filename = "leads" }: LeadsExportMenuProps) {
  const exportToCSV = () => {
    if (!data || data.length === 0) {
      toast.error("No data to export")
      return
    }

    try {
      // Flatten lead data for CSV
      const headers = [
        'Lead ID', 'Full Name', 'Email', 'Phone', 'Source', 'Product Inquiry',
        'Quantity', 'Tags', 'Assigned To', 'Lead Age (Days)', 'Created On'
      ]
      
      const csvRows = data.map(lead => [
        lead.lead_id,
        lead.full_name,
        lead.email || '',
        lead.phone || '',
        (lead.source || []).join('; '),
        (lead.product_inquiry || []).join('; '),
        lead.quantity || '',
        (lead.tags || []).join('; '),
        lead.assigned_to || 'Unassigned',
        lead.lead_age_days,
        new Date(lead.created_at).toLocaleDateString(),
      ])
      
      const csvContent = [
        headers.join(","),
        ...csvRows.map(row =>
          row.map(cell => {
            const value = String(cell || '')
            if (value.includes(',') || value.includes('"')) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value
          }).join(",")
        )
      ].join("\n")

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

