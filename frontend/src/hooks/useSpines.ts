/**
 * Spines React Query Hooks
 */

import { useQuery } from '@tanstack/react-query'
import { spinesService } from '@/services/spines'

export function useSpines() {
  return useQuery({
    queryKey: ['spines'],
    queryFn: () => spinesService.getSpines(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
