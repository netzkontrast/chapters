/**
 * Study Service
 * 
 * Handles drafts and notes management
 */

import { apiClient } from '@/lib/api-client'

export interface Draft {
  id: number
  title: string
  created_at: string
  updated_at: string
  block_count: number
  blocks?: any[]
  themes?: number[]
  mood?: string
}

export interface Note {
  id: number
  content: string
  tags: string[]
  voice_memo_url?: string
  created_at: string
  updated_at: string
}

export const studyService = {
  /**
   * Get user's drafts
   */
  async getDrafts(): Promise<Draft[]> {
    return apiClient.get<Draft[]>('/study/drafts')
  },

  /**
   * Get single draft
   */
  async getDraft(draftId: number): Promise<Draft> {
    return apiClient.get<Draft>(`/study/drafts/${draftId}`)
  },

  /**
   * Create draft
   */
  async createDraft(data: { title?: string; blocks?: any[] }): Promise<Draft> {
    return apiClient.post<Draft>('/study/drafts', data)
  },

  /**
   * Update draft
   */
  async updateDraft(draftId: number, data: { title?: string; blocks?: any[] }): Promise<Draft> {
    return apiClient.patch<Draft>(`/study/drafts/${draftId}`, data)
  },

  /**
   * Delete draft
   */
  async deleteDraft(draftId: number): Promise<void> {
    await apiClient.delete(`/study/drafts/${draftId}`)
  },

  /**
   * Publish draft as chapter
   */
  async publishDraft(draftId: number, data: any): Promise<any> {
    return apiClient.post(`/study/drafts/${draftId}/publish`, data)
  },

  /**
   * Get user's notes
   */
  async getNotes(): Promise<Note[]> {
    return apiClient.get<Note[]>('/study/notes')
  },

  /**
   * Create note
   */
  async createNote(data: { content: string; tags: string[] }): Promise<Note> {
    return apiClient.post<Note>('/study/notes', data)
  },

  /**
   * Update note
   */
  async updateNote(noteId: number, data: { content: string; tags: string[] }): Promise<Note> {
    return apiClient.patch<Note>(`/study/notes/${noteId}`, data)
  },

  /**
   * Delete note
   */
  async deleteNote(noteId: number): Promise<void> {
    await apiClient.delete(`/study/notes/${noteId}`)
  },
}
