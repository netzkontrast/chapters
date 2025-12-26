"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useThemes, useAddTheme, useRemoveTheme } from "@/hooks/useSearch"
import { motion, AnimatePresence } from "framer-motion"

interface ThemeSelectorProps {
  chapterId: number
  selectedThemes: Array<{ id: number; name: string }>
  onUpdate?: () => void
}

export function ThemeSelector({ chapterId, selectedThemes, onUpdate }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { data: allThemes = [] } = useThemes()
  const addTheme = useAddTheme()
  const removeTheme = useRemoveTheme()

  const selectedIds = new Set(selectedThemes.map(t => t.id))
  const canAddMore = selectedThemes.length < 3

  const handleAdd = async (themeId: number) => {
    if (!canAddMore) return
    
    try {
      await addTheme.mutateAsync({ chapterId, themeId })
      onUpdate?.()
    } catch (error) {
      console.error('Failed to add theme:', error)
    }
  }

  const handleRemove = async (themeId: number) => {
    try {
      await removeTheme.mutateAsync({ chapterId, themeId })
      onUpdate?.()
    } catch (error) {
      console.error('Failed to remove theme:', error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Selected Themes */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Themes {selectedThemes.length > 0 && `(${selectedThemes.length}/3)`}
        </label>
        
        {selectedThemes.length > 0 ? (
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedThemes.map((theme) => (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
              >
                <span>{theme.name}</span>
                <button
                  onClick={() => handleRemove(theme.id)}
                  className="hover:text-primary/70 transition-colors"
                  disabled={removeTheme.isPending}
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mb-2">
            No themes selected
          </p>
        )}

        {canAddMore && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 'Close' : 'Add Theme'}
          </Button>
        )}
      </div>

      {/* Theme Picker */}
      <AnimatePresence>
        {isOpen && canAddMore && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border border-border rounded-lg p-4 bg-card max-h-96 overflow-y-auto">
              <p className="text-xs text-muted-foreground mb-3">
                Select up to 3 themes that resonate with your chapter
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {allThemes
                  .filter(theme => !selectedIds.has(theme.id))
                  .map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => handleAdd(theme.id)}
                      disabled={addTheme.isPending}
                      className="flex items-center gap-2 p-3 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      {theme.emoji && (
                        <span className="text-xl">{theme.emoji}</span>
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {theme.name}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!canAddMore && (
        <p className="text-xs text-muted-foreground">
          Maximum 3 themes per chapter. Remove one to add another.
        </p>
      )}
    </div>
  )
}
