"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Lead } from "@/types/lead"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LeadsRowActions } from "./leads-row-actions"
import { Mail, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AssignedToEditor } from "./assigned-to-editor"
import { StarRating } from "@/components/ui/star-rating"

export const createLeadsColumns = (
  onViewLead?: (lead: Lead) => void,
  onEditLead?: (lead: Lead) => void,
  onDeleteLead?: (lead: Lead) => void
): ColumnDef<Lead>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "full_name",
    header: "Contact",
    cell: ({ row }) => {
      const lead = row.original
      const initials = lead.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'L'
      
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={lead.avatar_url} alt={lead.full_name} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div 
              className="font-medium text-sm cursor-pointer hover:text-primary transition-colors"
              onClick={() => onViewLead?.(lead)}
            >
              {lead.full_name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              {lead.email && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  <span>{lead.email}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    enableHiding: false,
  },
  {
    accessorKey: "phone",
    header: "Phone / WhatsApp",
    cell: ({ row }) => {
      const lead = row.original
      return (
        <div className="flex items-center gap-2">
          {lead.phone && (
            <div className="flex items-center gap-1 text-sm">
              <Phone className="h-3 w-3 text-muted-foreground" />
              <span>{lead.phone}</span>
            </div>
          )}
          {lead.whatsapp && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => window.open(lead.whatsapp!, '_blank')}
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "source",
    header: "Source",
    cell: ({ row }) => {
      const sources = row.original.source || []
      return (
        <div className="flex flex-wrap gap-1">
          {sources.slice(0, 2).map((src, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {src.replace('-', ' ')}
            </Badge>
          ))}
          {sources.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{sources.length - 2}
            </Badge>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const sources = row.getValue(id) as string[]
      return Array.isArray(value) && value.some(v => sources.includes(v))
    },
  },
  {
    accessorKey: "product_inquiry",
    header: "Product Inquiry",
    cell: ({ row }) => {
      const products = row.original.product_inquiry || []
      return (
        <div className="flex flex-wrap gap-1">
          {products.map((product, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs max-w-[150px] truncate">
              {product}
            </Badge>
          ))}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const products = row.getValue(id) as string[]
      return Array.isArray(value) && value.some(v => products.includes(v))
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => {
      const qty = row.original.quantity
      return qty ? <span className="text-sm">{qty}</span> : <span className="text-muted-foreground text-sm">—</span>
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.original.tags || []
      return (
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag, idx) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const tags = row.getValue(id) as string[]
      return Array.isArray(value) && value.some(v => tags.includes(v))
    },
  },
  {
    accessorKey: "assigned_to",
    header: "Assigned To",
    cell: ({ row }) => {
      const lead = row.original
      return (
        <AssignedToEditor
          leadId={lead.id}
          currentValue={lead.assigned_to}
          onUpdate={(userId) => {
            // Optimistically update the row data
            row.original.assigned_to = userId
          }}
        />
      )
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const lead = row.original
      const handleRatingChange = async (rating: number) => {
        try {
          const response = await fetch(`/api/leads/${lead.id}/rating`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rating }),
          })
          
          if (!response.ok) {
            throw new Error('Failed to update rating')
          }
          
          // Optimistically update the row data
          row.original.rating = rating
        } catch (error) {
          console.error('Error updating rating:', error)
          throw error
        }
      }
      
      return (
        <div onClick={(e) => e.stopPropagation()}>
          <StarRating
            rating={lead.rating}
            onRatingChange={handleRatingChange}
            size="sm"
          />
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const rating = row.getValue(id) as number | null
      // Convert value to number for comparison (faceted filter uses strings)
      if (Array.isArray(value)) {
        return value.some(v => {
          if (v === "null" || v === null || v === undefined) {
            return rating === null || rating === undefined
          }
          const numValue = typeof v === "string" ? parseInt(v, 10) : v
          return rating === numValue
        })
      }
      if (value === "null" || value === null || value === undefined) {
        return rating === null || rating === undefined
      }
      const numValue = typeof value === "string" ? parseInt(value, 10) : value
      return rating === numValue
    },
  },
  {
    accessorKey: "lead_age_days",
    header: "Lead Age",
    cell: ({ row }) => {
      const days = row.original.lead_age_days
      return (
        <span className="text-sm">
          {days}d
        </span>
      )
    },
  },
  {
    accessorKey: "created_at",
    header: "Created On",
    cell: ({ row }) => {
      const date = row.original.created_at
      return (
        <span className="text-sm">
          {new Date(date).toLocaleDateString()}
        </span>
      )
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      return (
        <LeadsRowActions
          row={row}
          onView={onViewLead}
          onEdit={onEditLead}
          onDelete={onDeleteLead}
        />
      )
    },
    enableHiding: false,
  },
]

