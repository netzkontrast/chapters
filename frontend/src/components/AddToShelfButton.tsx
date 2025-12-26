"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useShelfStatus, useAddToShelf, useRemoveFromShelf } from "@/hooks/useShelf"

interface AddToShelfButtonProps {
  bookId: number | string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
}

export function AddToShelfButton({ bookId, variant = "outline", size = "default" }: AddToShelfButtonProps) {
  const bookIdNum = typeof bookId === 'string' ? parseInt(bookId) : bookId
  const { data: status, isLoading } = useShelfStatus(bookIdNum)
  const addToShelf = useAddToShelf()
  const removeFromShelf = useRemoveFromShelf()
  const [isAnimating, setIsAnimating] = useState(false)

  const onShelf = status?.on_shelf || false

  const handleToggle = async () => {
    setIsAnimating(true)
    
    try {
      if (onShelf) {
        await removeFromShelf.mutateAsync(bookIdNum)
      } else {
        await addToShelf.mutateAsync(bookIdNum)
      }
    } catch (error) {
      console.error('Failed to toggle shelf status:', error)
    } finally {
      setTimeout(() => setIsAnimating(false), 300)
    }
  }

  if (isLoading) {
    return (
      <Button variant={variant} size={size} disabled>
        <span className="text-base mr-2">📚</span>
        Loading...
      </Button>
    )
  }

  return (
    <Button
      variant={onShelf ? "default" : variant}
      size={size}
      onClick={handleToggle}
      disabled={addToShelf.isPending || removeFromShelf.isPending}
      className={`transition-all ${isAnimating ? 'scale-95' : 'scale-100'}`}
    >
      <span className="text-base mr-2">{onShelf ? "✓" : "📚"}</span>
      {onShelf ? "On My Shelf" : "Add to Shelf"}
    </Button>
  )
}
