/**
 * Shelf React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { shelfService } from '@/services/shelf'

export function useShelf() {
  return useQuery({
    queryKey: ['shelf'],
    queryFn: () => shelfService.getShelf(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useShelfStatus(bookId: number) {
  return useQuery({
    queryKey: ['shelf-status', bookId],
    queryFn: () => shelfService.checkShelfStatus(bookId),
    enabled: !!bookId,
  })
}

export function useAddToShelf() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookId: number) => shelfService.addToShelf(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelf'] })
      queryClient.invalidateQueries({ queryKey: ['shelf-status'] })
    },
  })
}

export function useRemoveFromShelf() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookId: number) => shelfService.removeFromShelf(bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelf'] })
      queryClient.invalidateQueries({ queryKey: ['shelf-status'] })
    },
  })
}
