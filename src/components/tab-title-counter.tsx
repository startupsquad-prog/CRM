"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"

export function TabTitleCounter() {
  const [count, setCount] = useState<number | null>(null)
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (!isSignedIn) {
      setCount(0)
      return
    }

    // Fetch initial count
    const fetchCount = async () => {
      try {
        const response = await fetch('/api/leads/count')
        if (!response.ok) {
          return
        }
        const data = await response.json()
        setCount(data.count ?? 0)
      } catch (error) {
        console.error("Error fetching leads count:", error)
      }
    }

    // Initial fetch
    fetchCount()

    // Poll every 30 seconds
    const intervalId = setInterval(fetchCount, 30000)

    // Cleanup
    return () => {
      clearInterval(intervalId)
    }
  }, [isSignedIn])

  useEffect(() => {
    // Update document title
    const baseTitle = "CRM System - Customer Relationship Management"
    
    if (count !== null) {
      document.title = count > 0 ? `(${count}) ${baseTitle}` : baseTitle
    }
  }, [count])

  // This component doesn't render anything visible
  return null
}

