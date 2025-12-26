"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Copy, Check } from "lucide-react"

interface MuseHelperProps {
  isOpen: boolean
  onClose: () => void
  currentContent: {
    title: string
    blocks: any[]
  }
}

export function MuseHelper({ isOpen, onClose, currentContent }: MuseHelperProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleAction = async (action: string) => {
    setActiveAction(action)
    setIsLoading(true)
    setSuggestions([])

    // Check if there's content to analyze
    const hasContent = currentContent.blocks.some((block) => {
      if (typeof block.content === "string") {
        return block.content.trim().length > 0
      }
      if (block.content?.text) {
        return block.content.text.trim().length > 0
      }
      return false
    })

    // Simulate AI suggestions based on action
    setTimeout(() => {
      let newSuggestions: string[] = []

      switch (action) {
        case "first-line":
          // Always available - helps start writing
          newSuggestions = [
            "The morning arrived without ceremony, as mornings do.",
            "I've been thinking about what you said, about how silence has weight.",
            "There's a particular kind of loneliness that comes with crowds.",
          ]
          break
        case "tighten":
          if (!hasContent) {
            newSuggestions = [
              "Write something first, and I'll help you refine it.",
            ]
          } else {
            newSuggestions = [
              "Consider removing adverbs - they often weaken your prose.",
              "This paragraph could be split into two for better pacing.",
              "The opening sentence could be more direct and impactful.",
            ]
          }
          break
        case "title":
          if (!hasContent) {
            newSuggestions = [
              "Write a few lines first, and I'll suggest titles that capture your voice.",
            ]
          } else {
            newSuggestions = [
              "Between Silences",
              "The Weight of Ordinary Things",
              "What Remains Unsaid",
            ]
          }
          break
        case "expand":
          if (!hasContent) {
            newSuggestions = [
              "Write something first, and I'll help you deepen it.",
            ]
          } else {
            newSuggestions = [
              "What sensory details could you add here? Consider sound, smell, or texture.",
              "This moment feels rushed - what if you slowed down and explored the emotion?",
              "Consider adding a specific memory or image to ground this abstract idea.",
            ]
          }
          break
        case "mood":
          if (!hasContent) {
            newSuggestions = [
              "Write a few lines first, and I'll suggest moods that match your voice.",
            ]
          } else {
            // Context-aware mood suggestions based on content
            newSuggestions = [
              "contemplative",
              "bittersweet",
              "quietly hopeful",
              "melancholic",
              "tender",
            ]
          }
          break
      }

      setSuggestions(newSuggestions)
      setIsLoading(false)
    }, 1200)
  }

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
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
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          {/* Compact Right Panel - positioned above BTL bubble */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-6 bottom-24 z-50 w-80 max-h-[600px] bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-card flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🪶</span>
                  <h2 className="text-lg font-serif font-semibold text-foreground">
                    Muse
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4">
                {/* Description */}
                <p className="text-xs text-muted-foreground mb-4">
                  Your creative companion. Ask for suggestions, refinements, or inspiration.
                </p>

                {/* Action Buttons */}
                <div className="space-y-2 mb-4">
                  <Button
                    variant="outline"
                    onClick={() => handleAction("first-line")}
                    disabled={isLoading}
                    className="w-full justify-start text-left hover:bg-primary/5 hover:border-primary transition-all h-auto py-2"
                  >
                    <span className="text-base mr-2">✨</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">Suggest an opening</div>
                      <div className="text-xs text-muted-foreground">Get ideas for your first line</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleAction("tighten")}
                    disabled={isLoading || currentContent.blocks.length === 0}
                    className="w-full justify-start text-left hover:bg-primary/5 hover:border-primary transition-all h-auto py-2"
                  >
                    <span className="text-base mr-2">✂️</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">Tighten the prose</div>
                      <div className="text-xs text-muted-foreground">Make it more concise</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleAction("expand")}
                    disabled={isLoading || currentContent.blocks.length === 0}
                    className="w-full justify-start text-left hover:bg-primary/5 hover:border-primary transition-all h-auto py-2"
                  >
                    <span className="text-base mr-2">💡</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">Expand this moment</div>
                      <div className="text-xs text-muted-foreground">Add depth and detail</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleAction("title")}
                    disabled={isLoading}
                    className="w-full justify-start text-left hover:bg-primary/5 hover:border-primary transition-all h-auto py-2"
                  >
                    <span className="text-base mr-2">📝</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">Suggest a title</div>
                      <div className="text-xs text-muted-foreground">Find the perfect name</div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleAction("mood")}
                    disabled={isLoading}
                    className="w-full justify-start text-left hover:bg-primary/5 hover:border-primary transition-all h-auto py-2"
                  >
                    <span className="text-base mr-2">🎭</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">Suggest a mood</div>
                      <div className="text-xs text-muted-foreground">Capture the feeling</div>
                    </div>
                  </Button>
                </div>

                {/* Loading State */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-primary/5 border border-primary/20 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        🪶
                      </motion.div>
                      <p className="text-sm text-muted-foreground">
                        Muse is thinking...
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && !isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <h3 className="text-xs font-medium text-foreground mb-2">
                      Suggestions
                    </h3>
                    
                    {/* Check if it's an empty state message */}
                    {suggestions.length === 1 && suggestions[0].includes("Write") ? (
                      /* Empty state message */
                      <div className="p-3 bg-muted/50 border border-border rounded-lg">
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          {suggestions[0]}
                        </p>
                      </div>
                    ) : activeAction === "mood" ? (
                      /* Mood pills */
                      <div className="flex flex-wrap gap-1.5">
                        {suggestions.map((suggestion, index) => (
                          <motion.button
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleCopy(suggestion, index)}
                            className="px-3 py-1.5 text-xs rounded-full bg-primary/10 text-foreground border border-primary/20 hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            {suggestion}
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      /* Other suggestions as cards */
                      suggestions.map((suggestion, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="group p-3 bg-background border border-border rounded-lg hover:border-primary/40 transition-all"
                        >
                          <p className="text-xs text-foreground leading-relaxed mb-2">
                            {suggestion}
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy(suggestion, index)}
                            className="text-xs text-muted-foreground hover:text-primary h-6 px-2"
                          >
                            {copiedIndex === index ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
