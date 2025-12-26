"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Trash2, Edit2, Mic, Tag, X } from "lucide-react"

interface Note {
  id: number
  content: string
  voice_memo_url?: string
  tags: string[]
  created_at: string
  updated_at: string
}

interface NotesManagerProps {
  notes: Note[]
  onCreateNote: (content: string, tags: string[]) => Promise<void>
  onUpdateNote: (id: number, content: string, tags: string[]) => Promise<void>
  onDeleteNote: (id: number) => Promise<void>
  onPromoteToDraft?: (noteId: number) => Promise<void>
  isCreatingNote: boolean
  setIsCreatingNote: (value: boolean) => void
}

export function NotesManager({
  notes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onPromoteToDraft,
  isCreatingNote,
  setIsCreatingNote,
}: NotesManagerProps) {
  const [newNoteContent, setNewNoteContent] = useState("")
  const [newNoteTags, setNewNoteTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (noteId: number) => {
    setNoteToDelete(noteId)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (noteToDelete === null) return
    
    setIsDeleting(true)
    try {
      await onDeleteNote(noteToDelete)
      setDeleteModalOpen(false)
      setNoteToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) return
    await onCreateNote(newNoteContent, newNoteTags)
    setNewNoteContent("")
    setNewNoteTags([])
    setIsCreatingNote(false)
  }

  const addTag = () => {
    if (tagInput.trim() && !newNoteTags.includes(tagInput.trim())) {
      setNewNoteTags([...newNoteTags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setNewNoteTags(newNoteTags.filter((t) => t !== tag))
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Create Note Form */}
      <AnimatePresence>
        {isCreatingNote && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-card rounded-lg border border-border p-6 mb-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-serif font-semibold text-foreground">
                New Note
              </h3>
              <button
                onClick={() => {
                  setIsCreatingNote(false)
                  setNewNoteContent("")
                  setNewNoteTags([])
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <textarea
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              placeholder="Write your note..."
              rows={6}
              className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-primary transition-all duration-300 resize-none mb-4"
            />

            {/* Tags */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTag()}
                  placeholder="Add a tag..."
                  className="flex-1 px-3 py-2 bg-background border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-primary transition-all duration-300"
                />
                <Button
                  onClick={addTag}
                  size="sm"
                  variant="outline"
                >
                  <Tag className="h-4 w-4" />
                </Button>
              </div>
              {newNoteTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newNoteTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-primary/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsCreatingNote(false)
                  setNewNoteContent("")
                  setNewNoteTags([])
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateNote}
                disabled={!newNoteContent.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Save Note
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <p className="text-foreground font-serif text-lg mb-2">
            No notes yet
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Capture fleeting thoughts, fragments, and ideas. They might become chapters someday.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-lg border border-border p-5 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-muted-foreground">
                  {new Date(note.created_at).toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onPromoteToDraft && (
                    <button
                      onClick={() => onPromoteToDraft(note.id)}
                      className="p-1 text-primary hover:text-primary/80"
                      title="Promote to draft"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteClick(note.id)}
                    className="p-1 text-red-600 hover:text-red-700"
                    title="Delete note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <p className="text-foreground leading-relaxed mb-3 line-clamp-6">
                {note.content}
              </p>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {note.voice_memo_url && (
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mic className="h-4 w-4" />
                    <span>Voice memo attached</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Note"
        message="Are you sure you want to delete this note? This cannot be undone."
        confirmText="Delete Note"
        cancelText="Keep Note"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
