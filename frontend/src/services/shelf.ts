/**
 * Shelf Service
 * 
 * Handles curated Book collections
 */

import { apiClient } from '@/lib/api-client'

export interface ShelfBook {
  id: number
  user_id: number
  username: string
  display_name: string | null
  bio: string | null
  cover_image_url: string | null
  added_at: string
}

export const shelfService = {
  /**
   * Add a Book to user's Shelf
   */
  async addToShelf(bookId: number): Promise<{ message: string; shelf_id: number }> {
    return apiClient.post(`/engagement/books/${bookId}/shelf`)
  },

  /**
   * Remove a Book from user's Shelf
   */
  async removeFromShelf(bookId: number): Promise<void> {
    return apiClient.delete(`/engagement/books/${bookId}/shelf`)
  },

  /**
   * Get user's Shelf
   */
  async getShelf(): Promise<ShelfBook[]> {
    return apiClient.get('/engagement/shelf')
  },

  /**
   * Check if a Book is on user's Shelf
   */
  async checkShelfStatus(bookId: number): Promise<{ on_shelf: boolean }> {
    return apiClient.get(`/engagement/books/${bookId}/shelf/status`)
  },
}
