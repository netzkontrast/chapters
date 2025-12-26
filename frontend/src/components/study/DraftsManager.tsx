"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Plus, Trash2, Edit2, FileText, Calendar } from "lucide-react"
import Link from "next/link"

interface Draft {
  id: number
  title: string
  block_count: number
  created_at: string
  updated_at: string
}

interface DraftsManagerProps {
  drafts: Draft[]
  onDeleteDraft: (id: number) => Promise<void>
}

export function DraftsManager({
  drafts,
  onDeleteDraft,
}: DraftsManagerProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [draftToDelete, setDraftToDelete] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDeleteClick = (e: React.MouseEvent, draftId: number) => {
    e.preventDefault()
    setDraftToDelete(draftId)
    setDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (draftToDelete === null) return
    
    setIsDeleting(true)
    try {
      await onDeleteDraft(draftToDelete)
      setDeleteModalOpen(false)
      setDraftToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Content */}
      {drafts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">✍️</div>
          <p className="text-foreground font-serif text-lg mb-2">
            No drafts yet
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Every Book starts somewhere. A paragraph. A line. A thought you're not ready to name.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((draft, index) => (
            <motion.div
              key={draft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="relative"
            >
              <Link href={`/study/drafts/${draft.id}`} className="block h-full">
                <div className="bg-card rounded-lg border border-border p-5 hover:shadow-lg hover:border-primary/40 transition-all group cursor-pointer h-full flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-lg font-serif font-semibold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                      {draft.title || "Untitled Draft"}
                    </h3>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        <span>
                          {draft.block_count}{" "}
                          {draft.block_count === 1 ? "block" : "blocks"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>
                          {new Date(draft.updated_at).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-border opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <div
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 text-primary hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-all"
                      title="Edit draft"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="text-xs font-medium">Edit</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteClick(e, draft.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all"
                      title="Delete draft"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="text-xs font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Draft"
        message="Are you sure you want to delete this draft? This cannot be undone."
        confirmText="Delete Draft"
        cancelText="Keep Draft"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
