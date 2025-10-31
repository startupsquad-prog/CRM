"use client"

import { Row } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Copy, MessageSquare, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Lead } from "@/types/lead"

interface LeadsRowActionsProps {
  row: Row<Lead>
  onView?: (lead: Lead) => void
  onEdit?: (lead: Lead) => void
  onDuplicate?: (lead: Lead) => void
  onWhatsApp?: (lead: Lead) => void
  onDelete?: (lead: Lead) => void
}

export function LeadsRowActions({
  row,
  onView,
  onEdit,
  onDuplicate,
  onWhatsApp,
  onDelete,
}: LeadsRowActionsProps) {
  const lead = row.original

  const handleView = () => {
    if (onView) {
      onView(lead)
    } else {
      toast.info(`View lead: ${lead.full_name}`)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(lead)
    } else {
      toast.info(`Edit lead: ${lead.full_name}`)
    }
  }

  const handleDuplicate = () => {
    if (onDuplicate) {
      onDuplicate(lead)
    } else {
      toast.info(`Duplicate lead: ${lead.full_name}`)
    }
  }

  const handleWhatsApp = () => {
    if (lead.whatsapp) {
      window.open(lead.whatsapp, '_blank')
    } else if (onWhatsApp) {
      onWhatsApp(lead)
    } else {
      toast.error("WhatsApp number not available")
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(lead)
    } else {
      toast.info(`Delete lead: ${lead.full_name}`)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleView}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Lead
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate Lead
        </DropdownMenuItem>
        {lead.whatsapp && (
          <DropdownMenuItem onClick={handleWhatsApp}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Open WhatsApp
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Lead
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

