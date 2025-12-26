"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/LoadingState"
import { motion, AnimatePresence } from "framer-motion"

interface Margin {
  id: string
  user_id: string
  username: string
  text: string
  created_at: string
}

interface MarginsDrawerProps {
  chapterId: string
  margins: Margin[]
  isLoading: boolean
  onAddMargin: (text: string) => Promise<void>
}

export function MarginsDrawer({ chapterId, margins, isLoading, onAddMargin }: MarginsDrawerProps) {
  const [newMargin, setNewMargin] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMargin.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onAddMargin(newMargin.trim())
      setNewMargin("")
    } catch (error) {
      console.error('Failed to add margin:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h3 className="text-lg font-serif font-semibold text-foreground">
          Margins
        </h3>
        <p className="text-sm text-muted-foreground">
          Leave a comment in the margins
        </p>
      </div>

      {/* Margins List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <LoadingState message="Loading margins..." />
          </div>
        ) : margins.length > 0 ? (
          margins.map((margin, index) => (
            <motion.div
              key={margin.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card border border-border rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="font-medium text-sm text-foreground">
                  {margin.username}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(margin.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-foreground leading-relaxed text-sm">
                {margin.text}
              </p>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-sm text-muted-foreground mb-2">
              No margins yet
            </p>
            <p className="text-xs text-muted-foreground">
              Be the first to leave a comment
            </p>
          </div>
        )}
      </div>

      {/* Add Margin Form */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={newMargin}
            onChange={(e) => setNewMargin(e.target.value.slice(0, 500))}
            placeholder="Share your thoughts..."
            className="w-full min-h-[100px] px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newMargin.length}/500
            </span>
            <Button
              type="submit"
              disabled={!newMargin.trim() || isSubmitting}
              size="sm"
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
