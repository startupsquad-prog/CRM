"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { Badge } from "@/components/ui/badge"

interface NavCounterProps {
  apiPath: string
}

export function NavCounter({ apiPath }: NavCounterProps) {
  const [count, setCount] = useState<number | null>(null)
  const { isSignedIn } = useAuth()

  useEffect(() => {
    if (!isSignedIn) {
      setCount(0)
      return
    }

    const fetchCount = async () => {
      try {
        const response = await fetch(apiPath)
        if (!response.ok) {
          return
        }
        const data = await response.json()
        setCount(data.count ?? 0)
      } catch (error) {
        console.error(`Error fetching count from ${apiPath}:`, error)
      }
    }

    // Initial fetch
    fetchCount()

    // Poll every 30 seconds
    const intervalId = setInterval(fetchCount, 30000)

    return () => {
      clearInterval(intervalId)
    }
  }, [isSignedIn, apiPath])

  if (count === null || count === 0) {
    return null
  }

  return (
    <Badge variant="secondary" className="ml-auto">
      {count}
    </Badge>
  )
}

