"use client"

import { useState } from "react"
import Link from "next/link"
import { LoadingState } from "@/components/LoadingState"
import { useShelf, useRemoveFromShelf } from "@/hooks/useShelf"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"

export function ShelfView() {
  const { data: shelf, isLoading } = useShelf()
  const removeFromShelf = useRemoveFromShelf()
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [removeModalOpen, setRemoveModalOpen] = useState(false)
  const [bookToRemove, setBookToRemove] = useState<{ id: number; name: string } | null>(null)

  const handleRemoveClick = (bookId: number, bookName: string) => {
    setBookToRemove({ id: bookId, name: bookName })
    setRemoveModalOpen(true)
  }

  const handleConfirmRemove = async () => {
    if (!bookToRemove) return
    
    setRemovingId(bookToRemove.id)
    try {
      await removeFromShelf.mutateAsync(bookToRemove.id)
      setRemoveModalOpen(false)
      setBookToRemove(null)
    } catch (error) {
      console.error("Failed to remove from shelf:", error)
    } finally {
      setRemovingId(null)
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading your Shelf..." />
  }

  if (!shelf || shelf.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-6">📚</div>
        <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
          Your Shelf is Waiting
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Add Books that feel like home.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {shelf.map((book) => (
        <div
          key={book.id}
          className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all"
        >
          <Link href={`/books/${book.user_id}`} className="block">
            {/* Cover or placeholder */}
            {book.cover_image_url ? (
              <div className="w-full h-48 bg-muted">
                <img
                  src={book.cover_image_url}
                  alt={book.display_name || book.username}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <span className="text-6xl">📖</span>
              </div>
            )}

            {/* Book info */}
            <div className="p-6">
              <h3 className="text-xl font-serif font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                {book.display_name || book.username}
              </h3>
              
              <p className="text-sm text-muted-foreground mb-3">
                by {book.username}
              </p>

              {book.bio && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {book.bio}
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                Added {new Date(book.added_at).toLocaleDateString()}
              </p>
            </div>
          </Link>

          {/* Remove button */}
          <div className="px-6 pb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveClick(book.id, book.display_name || book.username)}
              disabled={removingId === book.id}
              className="w-full text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
            >
              {removingId === book.id ? "Removing..." : "Remove from Shelf"}
            </Button>
          </div>
        </div>
      ))}

      <ConfirmModal
        isOpen={removeModalOpen}
        onClose={() => setRemoveModalOpen(false)}
        onConfirm={handleConfirmRemove}
        title="Remove from Shelf"
        message={`Remove "${bookToRemove?.name}" from your Shelf? You can always add it back later.`}
        confirmText="Remove Book"
        cancelText="Keep on Shelf"
        variant="warning"
        isLoading={removingId !== null}
      />
    </div>
  )
}
