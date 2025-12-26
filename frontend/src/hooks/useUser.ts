/**
 * User Settings React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userService, PasswordUpdateData, BookProfileUpdateData } from '@/services/user'

export function useUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: () => userService.getBookProfile(),
    retry: false, // Don't retry on auth failures
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    refetchOnMount: false, // Don't refetch when component mounts
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  })
}

export function useBookProfile() {
  return useQuery({
    queryKey: ['book-profile'],
    queryFn: () => userService.getBookProfile(),
  })
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: (data: PasswordUpdateData) => userService.updatePassword(data),
  })
}

export function useUpdateBookProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: BookProfileUpdateData) => userService.updateBookProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-profile'] })
    },
  })
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (avatarPath: string) => userService.updateAvatar(avatarPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-profile'] })
    },
  })
}

export function useUploadCustomAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => userService.uploadCustomAvatar(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-profile'] })
    },
  })
}

export function useUploadCoverImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => userService.uploadCoverImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['book-profile'] })
    },
  })
}
