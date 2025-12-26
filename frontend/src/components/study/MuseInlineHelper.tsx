"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface MuseInlineHelperProps {
  draftId: number
}

export function MuseInlineHelper({ draftId }: MuseInlineHelperProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleAsk = async (action: string) => {
    setIsLoading(true)
    // TODO: Call Muse API
    setTimeout(() => {
      setSuggestions([
        "This feels like it wants to breathe more.",
        "What if you started with the image?",
      ])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="border-t border-border pt-8">
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="text-muted-foreground"
            >
              🪶 Ask Muse
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-foreground">Muse</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>

            {/* Muse Actions - Max 2-3 options */}
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAsk('first-line')}
                disabled={isLoading}
                className="w-full justify-start text-left"
              >
                🪶 Ask for a first line
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAsk('tighten')}
                disabled={isLoading}
                className="w-full justify-start text-left"
              >
                🪶 Tighten this
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAsk('title')}
                disabled={isLoading}
                className="w-full justify-start text-left"
              >
                🪶 Suggest a title
              </Button>
            </div>

            {/* Suggestions */}
            {isLoading && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Muse is thinking...</p>
              </div>
            )}

            {suggestions.length > 0 && !isLoading && (
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="p-4 bg-background border border-border rounded-lg"
                  >
                    <p className="text-sm text-foreground mb-3">{suggestion}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        Copy
                      </Button>
                      <Button size="sm" variant="ghost">
                        Ignore
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
