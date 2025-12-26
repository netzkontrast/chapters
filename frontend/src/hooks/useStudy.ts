/**
 * Study React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { studyService } from '@/services/study'

export function useDrafts() {
  return useQuery({
    queryKey: ['drafts'],
    queryFn: () => studyService.getDrafts(),
  })
}

export function useDraft(draftId: number) {
  return useQuery({
    queryKey: ['draft', draftId],
    queryFn: () => studyService.getDraft(draftId),
    enabled: !!draftId,
  })
}

export function useCreateDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => studyService.createDraft(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] })
    },
  })
}

export function useUpdateDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ draftId, data }: { draftId: number; data: any }) =>
      studyService.updateDraft(draftId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['draft', variables.draftId] })
      queryClient.invalidateQueries({ queryKey: ['drafts'] })
    },
  })
}

export function useDeleteDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (draftId: number) => studyService.deleteDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] })
    },
  })
}

export function usePublishDraft() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ draftId, data }: { draftId: number; data: any }) =>
      studyService.publishDraft(draftId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drafts'] })
      queryClient.invalidateQueries({ queryKey: ['chapters'] })
    },
  })
}

export function useNotes() {
  return useQuery({
    queryKey: ['notes'],
    queryFn: () => studyService.getNotes(),
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { content: string; tags: string[] }) =>
      studyService.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, content, tags }: { id: number; content: string; tags: string[] }) =>
      studyService.updateNote(id, { content, tags }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (noteId: number) => studyService.deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
    },
  })
}
