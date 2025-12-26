/**
 * Between the Lines React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { btlService } from '@/services/btl'

export function usePendingInvites() {
  return useQuery({
    queryKey: ['btl-invites'],
    queryFn: () => btlService.getPendingInvites(),
  })
}

export function useSendInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: {
      recipient_id: number
      note?: string
      quoted_line?: string
    }) => btlService.sendInvite(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['btl-invites'] })
    },
  })
}

export function useAcceptInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: number) => btlService.acceptInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['btl-invites'] })
      queryClient.invalidateQueries({ queryKey: ['btl-threads'] })
    },
  })
}

export function useDeclineInvite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (inviteId: number) => btlService.declineInvite(inviteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['btl-invites'] })
    },
  })
}

export function useThreads() {
  return useQuery({
    queryKey: ['btl-threads'],
    queryFn: () => btlService.getThreads(),
  })
}

export function useThreadMessages(threadId: number | null) {
  return useQuery({
    queryKey: ['btl-messages', threadId],
    queryFn: () => btlService.getMessages(threadId!),
    enabled: threadId !== null,
    refetchInterval: 5000, // Poll every 5 seconds for new messages
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ threadId, content }: { threadId: number; content: string }) =>
      btlService.sendMessage(threadId, content),
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: ['btl-messages', threadId] })
      queryClient.invalidateQueries({ queryKey: ['btl-threads'] })
    },
  })
}

export function useCloseThread() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (threadId: number) => btlService.closeThread(threadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['btl-threads'] })
    },
  })
}

export function useThreadPins(threadId: number | null) {
  return useQuery({
    queryKey: ['btl-pins', threadId],
    queryFn: () => btlService.getPins(threadId!),
    enabled: threadId !== null,
  })
}

export function useCreatePin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ threadId, data }: { threadId: number; data: { chapter_id: number; excerpt: string } }) =>
      btlService.createPin(threadId, data),
    onSuccess: (_, { threadId }) => {
      queryClient.invalidateQueries({ queryKey: ['btl-pins', threadId] })
    },
  })
}
