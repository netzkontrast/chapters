/**
 * Between the Lines Service
 * 
 * Handles connection invites and private conversations
 */

import { apiClient } from '@/lib/api-client'

export interface BTLInvite {
  id: number
  sender_id: number
  recipient_id: number
  note?: string
  quoted_line?: string
  status: 'pending' | 'accepted' | 'declined'
  created_at: string
}

export interface BTLThread {
  id: number
  participant1_id: number
  participant2_id: number
  status: 'open' | 'closed'
  created_at: string
  closed_at?: string
}

export interface BTLMessage {
  id: number
  thread_id: number
  sender_id: number
  content: string
  created_at: string
}

export interface BTLPin {
  id: number
  thread_id: number
  user_id: number
  chapter_id: number
  excerpt: string
  created_at: string
}

export const btlService = {
  /**
   * Send BTL invite
   */
  async sendInvite(data: {
    recipient_id: number
    note?: string
    quoted_line?: string
  }): Promise<BTLInvite> {
    return apiClient.post<BTLInvite>('/between-the-lines/invites', data)
  },

  /**
   * Get pending invites (received by current user)
   */
  async getPendingInvites(): Promise<BTLInvite[]> {
    return apiClient.get<BTLInvite[]>('/between-the-lines/invites')
  },

  /**
   * Accept invite
   */
  async acceptInvite(inviteId: number): Promise<BTLThread> {
    return apiClient.post<BTLThread>(`/between-the-lines/invites/${inviteId}/accept`)
  },

  /**
   * Decline invite
   */
  async declineInvite(inviteId: number): Promise<void> {
    await apiClient.post(`/between-the-lines/invites/${inviteId}/decline`)
  },

  /**
   * Get all threads
   */
  async getThreads(): Promise<BTLThread[]> {
    return apiClient.get<BTLThread[]>('/between-the-lines/threads')
  },

  /**
   * Get thread messages
   */
  async getMessages(threadId: number): Promise<BTLMessage[]> {
    return apiClient.get<BTLMessage[]>(`/between-the-lines/threads/${threadId}/messages`)
  },

  /**
   * Send message
   */
  async sendMessage(threadId: number, content: string): Promise<BTLMessage> {
    return apiClient.post<BTLMessage>(`/between-the-lines/threads/${threadId}/messages`, {
      content,
    })
  },

  /**
   * Close thread
   */
  async closeThread(threadId: number): Promise<void> {
    await apiClient.post(`/between-the-lines/threads/${threadId}/close`)
  },

  /**
   * Create pin
   */
  async createPin(threadId: number, data: {
    chapter_id: number
    excerpt: string
  }): Promise<BTLPin> {
    return apiClient.post<BTLPin>(`/between-the-lines/threads/${threadId}/pins`, data)
  },

  /**
   * Get thread pins
   */
  async getPins(threadId: number): Promise<BTLPin[]> {
    return apiClient.get<BTLPin[]>(`/between-the-lines/threads/${threadId}/pins`)
  },
}
