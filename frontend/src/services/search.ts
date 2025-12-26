/**
 * Search Service
 */

import { apiClient } from '@/lib/api-client'

export interface Theme {
  id: number
  name: string
  slug: string
  description?: string
  emoji?: string
  chapter_count: number
}

export interface ChapterSearchResult {
  id: number
  title?: string
  mood?: string
  cover_url?: string
  heart_count: number
  published_at: string
  author_id: number
  author_username: string
  author_book_id: number
  excerpt?: string
  themes: string[]
}

export interface SearchResponse {
  query: string
  chapters: ChapterSearchResult[]
  total: number
  page: number
  per_page: number
  has_more: boolean
}

export interface ThemeChaptersResponse {
  theme: Theme
  chapters: ChapterSearchResult[]
  page: number
  per_page: number
  has_more: boolean
}

export const searchService = {
  async search(query: string, page: number = 1): Promise<SearchResponse> {
    return apiClient.get<SearchResponse>('/search', {
      params: { q: query, page, per_page: 20 }
    })
  },

  async getThemes(): Promise<Theme[]> {
    return apiClient.get<Theme[]>('/search/themes')
  },

  async getThemeChapters(slug: string, page: number = 1): Promise<ThemeChaptersResponse> {
    return apiClient.get<ThemeChaptersResponse>(`/search/themes/${slug}`, {
      params: { page, per_page: 20 }
    })
  },

  async addThemeToChapter(chapterId: number, themeId: number): Promise<void> {
    await apiClient.post(`/search/chapters/${chapterId}/themes`, { theme_id: themeId })
  },

  async removeThemeFromChapter(chapterId: number, themeId: number): Promise<void> {
    await apiClient.delete(`/search/chapters/${chapterId}/themes/${themeId}`)
  },
}
