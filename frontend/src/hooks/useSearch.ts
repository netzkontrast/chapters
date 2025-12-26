/**
 * Search React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { searchService } from '@/services/search'

export function useSearch(query: string, page: number = 1) {
  return useQuery({
    queryKey: ['search', query, page],
    queryFn: () => searchService.search(query, page),
    enabled: query.length >= 2,
  })
}

export function useThemes() {
  return useQuery({
    queryKey: ['themes'],
    queryFn: () => searchService.getThemes(),
  })
}

export function useThemeChapters(slug: string, page: number = 1) {
  return useQuery({
    queryKey: ['theme-chapters', slug, page],
    queryFn: () => searchService.getThemeChapters(slug, page),
    enabled: !!slug,
  })
}

export function useAddTheme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chapterId, themeId }: { chapterId: number; themeId: number }) =>
      searchService.addThemeToChapter(chapterId, themeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] })
      queryClient.invalidateQueries({ queryKey: ['themes'] })
    },
  })
}

export function useRemoveTheme() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ chapterId, themeId }: { chapterId: number; themeId: number }) =>
      searchService.removeThemeFromChapter(chapterId, themeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chapters'] })
      queryClient.invalidateQueries({ queryKey: ['themes'] })
    },
  })
}
