"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { usePublishDraft } from "@/hooks/useStudy"
import { useUser } from "@/hooks/useUser"
import { motion, AnimatePresence } from "framer-motion"

interface PublishModalProps {
  draft: any
  onClose: () => void
}

export function PublishModal({ draft, onClose }: PublishModalProps) {
  const router = useRouter()
  const { data: user } = useUser()
  const publishDraft = usePublishDraft()
  
  const [mood, setMood] = useState("")
  const [error, setError] = useState("")

  const handlePublish = async () => {
    if (!draft.title) {
      setError("Please add a title before publishing")
      return
    }

    if (!user || user.open_pages < 1) {
      setError("You need an Open Page to publish")
      return
    }

    try {
      const chapter = await publishDraft.mutateAsync({
        draftId: draft.id,
        data: { mood: mood || undefined }
      })
      
      router.push(`/chapters/${chapter.id}`)
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to publish")
    }
  }

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="bg-card border border-border rounded-lg max-w-md w-full p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
                Open a Page
              </h2>
              <p className="text-sm text-muted-foreground">
                This chapter will join your Book.
              </p>
            </div>

            {/* Open Pages Info */}
            <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <p className="text-sm text-foreground mb-2">
                You have <strong>{user?.open_pages || 0}</strong> Open {user?.open_pages === 1 ? 'Page' : 'Pages'}.
              </p>
              <p className="text-xs text-muted-foreground">
                Publishing uses one Open Page.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Mood (Optional) */}
            <div className="mb-6">
              <Label htmlFor="mood" className="mb-2">
                Mood (optional)
              </Label>
              
              {/* Compact Mood Pills */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {[
                  "contemplative",
                  "bittersweet",
                  "hopeful",
                  "melancholic",
                  "tender",
                  "urgent",
                  "reflective",
                  "joyful"
                ].map((suggestedMood) => (
                  <button
                    key={suggestedMood}
                    type="button"
                    onClick={() => setMood(suggestedMood)}
                    className={`px-2.5 py-1 text-xs rounded-full transition-all ${
                      mood === suggestedMood
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                    }`}
                  >
                    {suggestedMood}
                  </button>
                ))}
              </div>

              {/* Custom Mood Input */}
              <input
                id="mood"
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value.slice(0, 100))}
                placeholder="or type your own..."
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {mood.length}/100 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handlePublish}
                disabled={publishDraft.isPending || !user || user.open_pages < 1}
                className="flex-1"
              >
                {publishDraft.isPending ? "Opening..." : "Open Page"}
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}
