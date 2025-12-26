/**
 * Chapters Service
 */

import { apiClient } from '@/lib/api-client'

export interface Chapter {
  id: number
  author_id: number
  title: string
  mood?: string
  theme?: string
  published_at: string
  blocks: any[]
  author: {
    username: string
    book_id: number
  }
}

export interface ChaptersListResponse {
  chapters: Chapter[]
  total: number
  page: number
  per_page: number
}

export const chaptersService = {
  /**
   * List all chapters (for discovery)
   */
  async listChapters(params: { page?: number; per_page?: number; author_id?: number } = {}): Promise<ChaptersListResponse> {
    const queryParams = new URLSearchParams()
    if (params.page) queryParams.append('page', params.page.toString())
    if (params.per_page) queryParams.append('per_page', params.per_page.toString())
    if (params.author_id) queryParams.append('author_id', params.author_id.toString())
    
    return apiClient.get<ChaptersListResponse>(`/chapters?${queryParams.toString()}`)
  },

  /**
   * Get a single chapter by ID
   */
  async getChapter(id: number): Promise<Chapter> {
    return apiClient.get<Chapter>(`/chapters/${id}`)
  },
}
