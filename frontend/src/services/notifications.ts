/**
 * Notifications Service - Rare, Human, Meaningful
 */

import { apiClient } from '@/lib/api-client'

export type NotificationType = 'margin' | 'shelf_add' | 'btl_reply' | 'btl_invite' | 'bookmark'

export interface Notification {
  id: number
  type: NotificationType
  message: string
  read: boolean
  created_at: string
  chapter_id?: number
  chapter_title?: string
  margin_id?: number
  btl_thread_id?: number
  btl_invite_id?: number
  actor_id?: number
  actor_username?: string
}

export interface UnreadCount {
  count: number
}

export interface QuietModeResponse {
  quiet_mode: boolean
  message: string
}

export const notificationsService = {
  async getNotifications(type?: NotificationType, unreadOnly: boolean = false): Promise<Notification[]> {
    const params: any = {}
    if (type) params.type = type
    if (unreadOnly) params.unread_only = true
    
    return apiClient.get<Notification[]>('/notifications', { params })
  },

  async getUnreadCount(): Promise<UnreadCount> {
    return apiClient.get<UnreadCount>('/notifications/unread-count')
  },

  async markAsRead(notificationId: number): Promise<void> {
    await apiClient.post(`/notifications/${notificationId}/read`)
  },

  async markAllAsRead(type?: NotificationType): Promise<void> {
    const params: any = {}
    if (type) params.type = type
    
    await apiClient.post('/notifications/mark-all-read', null, { params })
  },

  async toggleQuietMode(enabled: boolean): Promise<QuietModeResponse> {
    return apiClient.post<QuietModeResponse>('/notifications/quiet-mode', null, {
      params: { enabled }
    })
  },

  async getQuietMode(): Promise<QuietModeResponse> {
    return apiClient.get<QuietModeResponse>('/notifications/quiet-mode')
  },
}
