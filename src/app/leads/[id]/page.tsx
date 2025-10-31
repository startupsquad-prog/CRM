"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, usePathname } from "next/navigation"
import { useAuth } from "@clerk/nextjs"
import { Lead } from "@/types/lead"
import { LeadDetailView } from "@/components/lead-detail-view"
import { LeadDetailViewSkeleton } from "@/components/lead-detail-view-skeleton"

export default function LeadDetailPage() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const { isSignedIn, isLoaded } = useAuth()
  const leadId = params?.id as string

  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    
    if (!isSignedIn) {
      router.push('/auth')
      return
    }

    if (!leadId) return

    const fetchLead = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/leads/${leadId}`)
        if (!response.ok) {
          if (response.status === 404) {
            router.push('/leads')
            return
          }
          throw new Error('Failed to fetch lead')
        }
        
        const data = await response.json()
        setLead(data.lead)
      } catch (error) {
        console.error('Error fetching lead:', error)
        router.push('/leads')
      } finally {
        setLoading(false)
      }
    }

    fetchLead()
  }, [leadId, isLoaded, isSignedIn, router])

  if (!isLoaded || loading) {
    return <LeadDetailViewSkeleton />
  }

  if (!lead) {
    return null // Will redirect
  }

  // Determine base path for breadcrumbs
  const isAdminPath = pathname?.includes('/admin')
  const basePath = isAdminPath ? '/admin/leads-overview' : '/employee/leads'

  return (
    <LeadDetailView 
      lead={lead} 
      basePath={basePath}
      onLeadUpdate={(updatedLead) => setLead(updatedLead)}
    />
  )
}

