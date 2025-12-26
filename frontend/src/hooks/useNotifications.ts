/**
 * Notifications React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsService, NotificationType } from '@/services/notifications'

export function useNotifications(type?: NotificationType, unreadOnly: boolean = false) {
  return useQuery({
    queryKey: ['notifications', type, unreadOnly],
    queryFn: () => notificationsService.getNotifications(type, unreadOnly),
    refetchInterval: 30000, // Poll every 30 seconds (respectful, not aggressive)
    staleTime: 25000, // Consider data fresh for 25 seconds to prevent glitching
  })
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 25000, // Consider data fresh for 25 seconds to prevent glitching
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: number) => notificationsService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (type?: NotificationType) => notificationsService.markAllAsRead(type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })
}

export function useToggleQuietMode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (enabled: boolean) => notificationsService.toggleQuietMode(enabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiet-mode'] })
    },
  })
}

export function useQuietMode() {
  return useQuery({
    queryKey: ['quiet-mode'],
    queryFn: () => notificationsService.getQuietMode(),
  })
}
