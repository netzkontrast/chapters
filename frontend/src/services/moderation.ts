/**
 * Moderation Service
 *
 * Handles blocking and reporting
 */

import { apiClient } from '@/lib/api-client'

export interface CreateReportData {
  reported_user_id?: number
  reported_chapter_id?: number
  reason: string
  details: string
}

export interface Report {
  id: number
  reporter_id: number
  reported_user_id?: number
  reported_chapter_id?: number
  reason: string
  details: string
  status: string
  created_at: string
}

export const moderationService = {
  /**
   * Create a report
   */
  async createReport(data: CreateReportData): Promise<Report> {
    return apiClient.post<Report>('/moderation/reports', data)
  }
}
