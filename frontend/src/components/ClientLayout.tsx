"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { ToastProvider } from "@/components/ui/toast"
import { BTLChatBubble } from "@/components/btl/BTLChatBubble"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 10 * 60 * 1000, // 10 minutes - longer cache
            gcTime: 15 * 60 * 1000, // 15 minutes - keep in cache longer
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Don't refetch on component mount
            retry: (failureCount, error: any) => {
              // Don't retry on 401 (auth errors)
              if (error?.status === 401) {
                return false
              }
              // Retry other errors up to 2 times
              return failureCount < 2
            },
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
        <BTLChatBubble enabled={true} />
      </ToastProvider>
    </QueryClientProvider>
  )
}
