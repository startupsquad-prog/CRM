"use client"

import { Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ComingSoon({ title }: { title?: string }) {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <div className="px-4 lg:px-6">
          <Card className="border-dashed">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-muted p-4">
                  <Clock className="h-8 w-8 text-muted-foreground animate-pulse" />
                </div>
              </div>
              <CardTitle className="text-2xl">{title || "Coming Soon"}</CardTitle>
              <CardDescription className="text-base mt-2">
                This feature is under development and will be available soon.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                We're working hard to bring you this functionality. Check back later!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

