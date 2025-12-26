/**
 * Spines Service
 * 
 * Handles people discovery through Books
 */

import { apiClient } from '@/lib/api-client'

export interface Spine {
  book_id: number
  user_id: number
  username: string
  display_name: string | null
  bio: string | null
  cover_image_url: string | null
  last_chapter_at: string | null
}

export const spinesService = {
  /**
   * Get Spines - Books you've interacted with
   * (read from, added to Shelf, or seen in Quiet Picks)
   */
  async getSpines(): Promise<Spine[]> {
    return apiClient.get('/library/spines-discovery')
  },
}
