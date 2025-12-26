"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useSendInvite } from "@/hooks/useBTL"

interface BetweenTheLinesModalProps {
  isOpen: boolean
  onClose: () => void
  recipientId: number
  bookTitle: string
}

export function BetweenTheLinesModal({
  isOpen,
  onClose,
  recipientId,
  bookTitle,
}: BetweenTheLinesModalProps) {
  const [note, setNote] = useState("")
  const [quotedLine, setQuotedLine] = useState("")
  const [error, setError] = useState("")
  
  const sendInvite = useSendInvite()

  const handleSend = async () => {
    if (!note.trim() && !quotedLine.trim()) {
      setError("Please include either a note or a quoted line")
      return
    }

    setError("")

    try {
      await sendInvite.mutateAsync({
        recipient_id: recipientId,
        note: note.trim() || undefined,
        quoted_line: quotedLine.trim() || undefined,
      })
      onClose()
      setNote("")
      setQuotedLine("")
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to send invite. Please try again.")
    }
  }

  const handleClose = () => {
    setNote("")
    setQuotedLine("")
    setError("")
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-serif font-semibold text-foreground mb-2">
                      Between the Lines
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      with {bookTitle}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Close"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Explanation */}
                <div className="mb-6 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">
                    This is a quiet space for two people whose Books resonate.
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    No feed. No audience. Just conversation.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    They can accept or decline. Nothing opens automatically.
                  </p>
                </div>

                {/* Requirements */}
                <div className="mb-6 p-4 bg-muted/30 border border-border rounded-lg">
                  <p className="text-xs font-medium text-foreground mb-2">Requirements:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• You must follow each other</li>
                    <li>• Both must have 3+ published chapters</li>
                    <li>• Limit: 3 invites per day</li>
                  </ul>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Note Input */}
                <div className="mb-6">
                  <Label htmlFor="btl-note" className="mb-2">
                    What moved you?
                  </Label>
                  <textarea
                    id="btl-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value.slice(0, 500))}
                    placeholder="Share what resonated with you..."
                    className="w-full min-h-[120px] px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {note.length}/500 characters
                  </p>
                </div>

                {/* Quoted Line Input */}
                <div className="mb-6">
                  <Label htmlFor="btl-quote" className="mb-2">
                    Include a line that spoke to you? (Optional)
                  </Label>
                  <textarea
                    id="btl-quote"
                    value={quotedLine}
                    onChange={(e) => setQuotedLine(e.target.value.slice(0, 300))}
                    placeholder="Quote a specific line from their writing..."
                    className="w-full min-h-[80px] px-3 py-2 bg-background border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {quotedLine.length}/300 characters
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleSend}
                    disabled={(!note.trim() && !quotedLine.trim()) || sendInvite.isPending}
                    className="flex-1"
                  >
                    {sendInvite.isPending ? "Sending..." : "Send Invitation"}
                  </Button>
                  <Button
                    onClick={handleClose}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
