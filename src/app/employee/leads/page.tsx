"use client"

import { useState, useMemo, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { LeadsTable } from "@/components/leads-table/leads-table"
import { createLeadsColumns } from "@/components/leads-table/leads-table-columns"
import { Lead } from "@/types/lead"
import { PrimaryFilter } from "@/components/leads-table/leads-filter-tabs"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"

export default function EmployeeLeadsPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const router = useRouter()
  
  const [view, setView] = useState<"kanban" | "table">("kanban")
  const [primaryFilter, setPrimaryFilter] = useState<PrimaryFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [allLeads, setAllLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/marketing')
    }
  }, [isLoaded, isSignedIn, router])

  // Fetch leads from Supabase
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    const fetchLeads = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (primaryFilter !== 'all') {
          params.append('stage', primaryFilter)
        }
        if (dateRange.from) {
          params.append('dateFrom', dateRange.from.toISOString())
        }
        if (dateRange.to) {
          params.append('dateTo', dateRange.to.toISOString())
        }
        if (searchQuery) {
          params.append('search', searchQuery)
        }

        const response = await fetch(`/api/leads?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch leads')
        }
        
        const data = await response.json()
        setAllLeads(data.leads || [])
      } catch (error) {
        console.error('Error fetching leads:', error)
        toast.error('Failed to load leads')
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [isLoaded, isSignedIn, primaryFilter, dateRange.from, dateRange.to, searchQuery])

  // Filter by search query (already done in API, but keeping for client-side fallback)
  const filteredBySearch = useMemo(() => {
    if (!searchQuery) return allLeads
    
    const query = searchQuery.toLowerCase()
    return allLeads.filter(lead =>
      lead.full_name.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.phone?.toLowerCase().includes(query) ||
      lead.lead_id.toLowerCase().includes(query)
    )
  }, [allLeads, searchQuery])

  // Filter by date range (already done in API, but keeping for client-side fallback)
  const filteredByDate = useMemo(() => {
    if (!dateRange.from && !dateRange.to) return filteredBySearch
    
    return filteredBySearch.filter(lead => {
      const leadDate = new Date(lead.created_at)
      if (dateRange.from && leadDate < dateRange.from) return false
      if (dateRange.to && leadDate > dateRange.to) return false
      return true
    })
  }, [filteredBySearch, dateRange])

  const columns = useMemo(
    () => createLeadsColumns(
      (lead) => toast.info(`View lead: ${lead.full_name}`),
      (lead) => toast.info(`Edit lead: ${lead.full_name}`),
      (lead) => toast.info(`Delete lead: ${lead.full_name}`)
    ),
    []
  )

  const handleAddLead = () => {
    toast.info("Add lead functionality will be implemented soon")
  }

  const handleViewLead = (lead: Lead) => {
    router.push(`/leads/${lead.id}`)
  }

  const handleEditLead = (lead: Lead) => {
    toast.info(`Editing lead: ${lead.full_name}`)
  }

  const handleDeleteLead = (lead: Lead) => {
    toast.info(`Deleting lead: ${lead.full_name}`)
  }

  if (!isLoaded) {
    return (
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden w-full max-w-full">
        <div className="flex flex-col gap-3 px-4 lg:px-6 flex-1 min-h-0 overflow-hidden py-3 w-full max-w-full min-w-0">
          <div className="flex-shrink-0 space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex-1 min-h-0 flex flex-col w-full max-w-full min-w-0">
            <Skeleton className="h-full w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!isSignedIn) {
    return null // Will redirect
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden w-full max-w-full">
      <div className="flex flex-col gap-3 px-4 lg:px-6 flex-1 min-h-0 overflow-hidden py-3 w-full max-w-full min-w-0">
        <div className="flex-shrink-0">
          <h2 className="text-2xl font-bold tracking-tight">My Leads</h2>
          <p className="text-muted-foreground">
            Manage and track your sales leads
          </p>
        </div>
        
        <div className="flex-1 min-h-0 flex flex-col w-full max-w-full min-w-0">
          <LeadsTable
            columns={columns}
            data={filteredByDate}
            loading={loading}
            initialLoading={loading && allLeads.length === 0}
            view={view}
            onViewChange={setView}
            primaryFilter={primaryFilter}
            onPrimaryFilterChange={setPrimaryFilter}
            onSearchChange={setSearchQuery}
            onDateRangeChange={setDateRange}
            onAddLead={handleAddLead}
            onViewLead={handleViewLead}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            searchPlaceholder="Search by name, email, phone, or lead ID..."
            addButtonText="Add Lead"
          />
        </div>
      </div>
    </div>
  )
}
