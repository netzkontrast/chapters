"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { Plus, X, Image, Music, Video, Quote, Trash2, GripVertical, ArrowLeft } from "lucide-react"
import { DraftBlockEditor } from "./DraftBlockEditor"
import { MuseHelper } from "./MuseHelper"
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader"
import { Footer } from "@/components/Footer"
import { COPY } from "@/constants/copy"

interface Block {
  id: string
  type: "text" | "image" | "audio" | "video" | "quote"
  content: any
  position: number
}

interface ChapterComposerProps {
  initialBlocks?: Block[]
  initialTitle?: string
  initialThemes?: number[]
  initialMood?: string
  onSave?: (data: any) => Promise<void>
  onPublish?: (data: any) => Promise<void>
  onDelete?: () => Promise<void>
  mode?: "create" | "edit"
  isDraft?: boolean
}

export function ChapterComposer({
  initialBlocks = [],
  initialTitle = "",
  initialThemes = [],
  initialMood = "",
  onSave,
  onPublish,
  onDelete,
  mode = "create",
  isDraft = true,
}: ChapterComposerProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialTitle)
  const [blocks, setBlocks] = useState<Block[]>(
    initialBlocks.length > 0
      ? initialBlocks
      : [{ id: "1", type: "text", content: "", position: 0 }]
  )
  const [selectedThemes, setSelectedThemes] = useState<number[]>(initialThemes)
  const [mood, setMood] = useState(initialMood)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showMuseHelper, setShowMuseHelper] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const mediaBlockCount = blocks.filter((b) =>
    ["image", "audio", "video"].includes(b.type)
  ).length

  const canAddMediaBlock = mediaBlockCount < 2
  const canAddBlock = blocks.length < 12

  const addBlock = (type: Block["type"]) => {
    if (!canAddBlock) return
    if (["image", "audio", "video"].includes(type) && !canAddMediaBlock) return

    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: type === "quote" ? { text: "", source: "" } : "",
      position: blocks.length,
    }
    setBlocks([...blocks, newBlock])
  }

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, content } : b)))
  }

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) return // Keep at least one block
    setBlocks(blocks.filter((b) => b.id !== id))
  }

  const moveBlock = (id: string, direction: "up" | "down") => {
    const index = blocks.findIndex((b) => b.id === id)
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === blocks.length - 1)
    )
      return

    const newBlocks = [...blocks]
    const targetIndex = direction === "up" ? index - 1 : index + 1
    ;[newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ]
    setBlocks(newBlocks.map((b, i) => ({ ...b, position: i })))
  }

  const handleSave = async () => {
    if (!onSave) return
    setIsSaving(true)
    try {
      await onSave({ title, blocks, themes: selectedThemes, mood })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async (publishData: any) => {
    if (!onPublish) return
    await onPublish(publishData)
  }

  const handleDelete = async () => {
    if (!onDelete) return
    setIsDeleting(true)
    try {
      await onDelete()
      setShowDeleteModal(false)
    } catch (error) {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <AuthenticatedHeader title={COPY.NAV.STUDY} />

      {/* Sub-header with draft controls */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/study')}
                className="text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Study
              </Button>
              <div className="h-6 w-px bg-border" />
              <span className="text-sm font-medium text-foreground">
                {isDraft ? "Draft" : mode === "create" ? "New Chapter" : "Edit Chapter"}
              </span>
              {isDraft && (
                <span className="text-xs bg-accent/20 text-accent px-3 py-1 rounded-full">
                  Auto-saving
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMuseHelper(!showMuseHelper)}
                className="text-muted-foreground hover:text-foreground"
              >
                🪶 Muse
              </Button>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              {isDraft && onSave && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-md transition-all duration-200 hover:scale-105"
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Title */}
        <div className="mb-8">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chapter title..."
            className="w-full text-4xl font-serif font-bold text-foreground placeholder:text-muted-foreground/40 bg-transparent border-none focus:outline-none focus:ring-0"
          />
        </div>

        {/* Blocks */}
        <div className="space-y-4 mb-8">
          <AnimatePresence>
            {blocks.map((block, index) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="group relative"
              >
                {/* Block Controls */}
                <div className="absolute -left-12 top-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                  <button
                    onClick={() => moveBlock(block.id, "up")}
                    disabled={index === 0}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    disabled={blocks.length === 1}
                    className="p-1 text-red-600 hover:text-red-700 disabled:opacity-30 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Block Content */}
                <DraftBlockEditor
                  block={block}
                  onChange={(content) => updateBlock(block.id, content)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add Block Menu */}
        {canAddBlock && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addBlock("text")}
              className="text-foreground hover:text-primary hover:border-primary transition-all"
            >
              <Plus className="h-4 w-4 mr-1" />
              Text
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addBlock("quote")}
              className="text-foreground hover:text-primary hover:border-primary transition-all"
            >
              <Quote className="h-4 w-4 mr-1" />
              Quote
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addBlock("image")}
              disabled={!canAddMediaBlock}
              className="text-foreground hover:text-primary hover:border-primary disabled:opacity-50 transition-all"
            >
              <Image className="h-4 w-4 mr-1" />
              Image {!canAddMediaBlock && "(2/2)"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addBlock("audio")}
              disabled={!canAddMediaBlock}
              className="text-foreground hover:text-primary hover:border-primary disabled:opacity-50 transition-all"
            >
              <Music className="h-4 w-4 mr-1" />
              Audio {!canAddMediaBlock && "(2/2)"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addBlock("video")}
              disabled={!canAddMediaBlock}
              className="text-foreground hover:text-primary hover:border-primary disabled:opacity-50 transition-all"
            >
              <Video className="h-4 w-4 mr-1" />
              Video {!canAddMediaBlock && "(2/2)"}
            </Button>
          </div>
        )}

        {!canAddBlock && (
          <p className="text-sm text-muted-foreground mb-8">
            Maximum 12 blocks reached
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-6 mb-12">
          {/* TODO: Re-enable theme selector with proper data structure
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Themes (up to 3)
            </label>
            <ThemeSelector
              selectedThemes={selectedThemes}
              onChange={setSelectedThemes}
              maxThemes={3}
            />
          </div>
          */}

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Mood (optional)
            </label>
            
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
            <div className="relative">
              <input
                type="text"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="or type your own..."
                className="w-full px-3 py-2 text-sm bg-background border border-input rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:border-primary transition-all"
              />
              {mood && (
                <button
                  type="button"
                  onClick={() => setMood("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Publish Button */}
        {isDraft && onPublish && (
          <div className="flex justify-center">
            <Button
              onClick={() => onPublish({ title, blocks, themes: selectedThemes, mood })}
              disabled={!title.trim() || blocks.every((b) => !b.content)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              Open Page
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />

      {/* Muse Helper Sidebar */}
      <MuseHelper
        isOpen={showMuseHelper}
        onClose={() => setShowMuseHelper(false)}
        currentContent={{ title, blocks }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Draft"
        message="Are you sure you want to delete this draft? This action cannot be undone."
        confirmText="Delete Draft"
        cancelText="Keep Draft"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  )
}
