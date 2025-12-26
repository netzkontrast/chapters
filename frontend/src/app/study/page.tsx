"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { PageTransition, TabTransition } from "@/components/PageTransition"
import { LoadingState } from "@/components/LoadingState"
import { useDrafts, useNotes, useCreateDraft, useDeleteDraft, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/useStudy"
import { AnimatePresence } from "framer-motion"
import { Footer } from "@/components/Footer"
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader"
import { COPY } from "@/constants/copy"
import { DraftsManager } from "@/components/study/DraftsManager"
import { NotesManager } from "@/components/study/NotesManager"
import { UnifiedSearchBar } from "@/components/search/UnifiedSearchBar"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"

export default function StudyPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState<'drafts' | 'notes'>('drafts')
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"updated" | "created">("updated")
  const [isCreatingNote, setIsCreatingNote] = useState(false)

  const { data: drafts, isLoading: draftsLoading } = useDrafts()
  const { data: notes, isLoading: notesLoading } = useNotes()
  
  const createDraftMutation = useCreateDraft()
  const deleteDraftMutation = useDeleteDraft()
  const createNoteMutation = useCreateNote()
  const updateNoteMutation = useUpdateNote()
  const deleteNoteMutation = useDeleteNote()

  // Get all unique tags from notes
  const allTags = Array.from(
    new Set((notes || []).flatMap((note) => note.tags))
  ).sort()

  // Filter drafts - handle null/undefined titles
  const filteredDrafts = (drafts || [])
    .filter((draft) =>
      (draft.title || "").toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(sortBy === "updated" ? a.updated_at : a.created_at)
      const dateB = new Date(sortBy === "updated" ? b.updated_at : b.created_at)
      return dateB.getTime() - dateA.getTime()
    })

  // Filter notes
  const filteredNotes = (notes || []).filter((note) => {
    const matchesSearch =
      !searchQuery ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    const matchesTag = !selectedTag || note.tags.includes(selectedTag)
    return matchesSearch && matchesTag
  })

  const handleCreateDraft = async () => {
    try {
      showToast({
        type: "info",
        title: "Creating draft",
        message: "Opening your editor...",
      })
      
      const draft = await createDraftMutation.mutateAsync({
        title: "",
        blocks: [{ block_type: "text", content: { text: "" }, position: 0 }]
      })
      
      // Immediately navigate to the draft editor
      router.push(`/study/drafts/${draft.id}`)
    } catch (error: any) {
      console.error("Failed to create draft:", error)
      showToast({
        type: "error",
        title: "Failed to create draft",
        message: error?.response?.data?.detail || "Please try again",
      })
    }
  }

  const handleDeleteDraft = async (id: number) => {
    try {
      await deleteDraftMutation.mutateAsync(id)
      showToast({
        type: "success",
        title: "Draft deleted",
        message: "Your draft has been removed",
      })
    } catch (error) {
      console.error("Failed to delete draft:", error)
      showToast({
        type: "error",
        title: "Failed to delete draft",
        message: "Please try again",
      })
    }
  }

  const handleCreateNote = async (content: string, tags: string[]) => {
    try {
      await createNoteMutation.mutateAsync({ content, tags })
      showToast({
        type: "success",
        title: "Note created",
        message: "Your note has been saved",
      })
    } catch (error) {
      console.error("Failed to create note:", error)
      showToast({
        type: "error",
        title: "Failed to create note",
        message: "Please try again",
      })
    }
  }

  const handleUpdateNote = async (id: number, content: string, tags: string[]) => {
    try {
      await updateNoteMutation.mutateAsync({ id, content, tags })
      showToast({
        type: "success",
        title: "Note updated",
        message: "Your changes have been saved",
      })
    } catch (error) {
      console.error("Failed to update note:", error)
      showToast({
        type: "error",
        title: "Failed to update note",
        message: "Please try again",
      })
    }
  }

  const handleDeleteNote = async (id: number) => {
    try {
      await deleteNoteMutation.mutateAsync(id)
      showToast({
        type: "success",
        title: "Note deleted",
        message: "Your note has been removed",
      })
    } catch (error) {
      console.error("Failed to delete note:", error)
      showToast({
        type: "error",
        title: "Failed to delete note",
        message: "Please try again",
      })
    }
  }

  const handlePromoteToDraft = async (noteId: number) => {
    const note = notes?.find(n => Number(n.id) === noteId)
    if (!note) return

    try {
      const draft = await createDraftMutation.mutateAsync({
        title: "",
        blocks: [{ block_type: "text", content: { text: note.content }, position: 0 }]
      })
      showToast({
        type: "success",
        title: "Note promoted to draft",
        message: "Opening your new draft...",
      })
      router.push(`/study/drafts/${draft.id}`)
    } catch (error: any) {
      console.error("Failed to promote note:", error)
      showToast({
        type: "error",
        title: "Failed to promote note",
        message: error?.response?.data?.detail || "Please try again",
      })
    }
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <AuthenticatedHeader title={COPY.NAV.STUDY} />

        {/* Search Bar Section with Filters */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex gap-3 items-center">
              <div className="flex-1">
                <UnifiedSearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder={activeTab === 'drafts' ? 'Search drafts...' : 'Search notes...'}
                />
              </div>
              <div className="flex gap-3">
                {activeTab === 'drafts' && (
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "updated" | "created")}
                    className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="updated">Recently updated</option>
                    <option value="created">Recently created</option>
                  </select>
                )}
                {activeTab === 'notes' && allTags.length > 0 && (
                  <select
                    value={selectedTag || ""}
                    onChange={(e) => setSelectedTag(e.target.value || null)}
                    className="px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All tags</option>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs with Action Button */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('drafts')}
                  className={`py-4 border-b-2 transition-colors font-serif ${
                    activeTab === 'drafts'
                      ? 'border-primary text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Drafts
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-4 border-b-2 transition-colors font-serif ${
                    activeTab === 'notes'
                      ? 'border-primary text-foreground font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Note Nook
                </button>
              </div>
              <div className="py-2">
                {activeTab === 'drafts' ? (
                  <Button
                    onClick={handleCreateDraft}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Draft
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      // We'll need to pass this down or handle it differently
                      // For now, let's create a state to trigger note creation
                      setIsCreatingNote(true)
                    }}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Note
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'drafts' && (
              <TabTransition key="drafts">
                {draftsLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <LoadingState message="Loading drafts..." />
                  </div>
                ) : (
                  <DraftsManager
                    drafts={filteredDrafts}
                    onDeleteDraft={handleDeleteDraft}
                  />
                )}
              </TabTransition>
            )}

            {activeTab === 'notes' && (
              <TabTransition key="notes">
                {notesLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <LoadingState message="Loading notes..." />
                  </div>
                ) : (
                  <NotesManager
                    notes={filteredNotes}
                    onCreateNote={handleCreateNote}
                    onUpdateNote={handleUpdateNote}
                    onDeleteNote={handleDeleteNote}
                    onPromoteToDraft={handlePromoteToDraft}
                    isCreatingNote={isCreatingNote}
                    setIsCreatingNote={setIsCreatingNote}
                  />
                )}
              </TabTransition>
            )}
          </AnimatePresence>
        </div>

        <Footer />
      </div>
    </PageTransition>
  )
}
