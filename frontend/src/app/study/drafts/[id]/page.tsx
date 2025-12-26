"use client"

import { useParams, useRouter } from "next/navigation"
import { LoadingState } from "@/components/LoadingState"
import { useDraft, useUpdateDraft, useDeleteDraft, usePublishDraft } from "@/hooks/useStudy"
import { ChapterComposer } from "@/components/study/ChapterComposer"
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader"
import { Footer } from "@/components/Footer"
import { COPY } from "@/constants/copy"
import { useToast } from "@/components/ui/toast"

export default function DraftEditorPage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const draftId = parseInt(params.id as string)
  
  const { data: draft, isLoading } = useDraft(draftId)
  const updateDraft = useUpdateDraft()
  const deleteDraft = useDeleteDraft()
  const publishDraft = usePublishDraft()

  const handleSave = async (data: any) => {
    try {
      console.log('=== SAVE DEBUG ===')
      console.log('Raw data:', data)
      console.log('Blocks:', data.blocks)
      console.log('First block:', data.blocks[0])
      
      const payload = {
        title: data.title,
        blocks: data.blocks.map((block: any, index: number) => {
          console.log(`Block ${index}:`, block)
          console.log(`Block ${index} type:`, block.type)
          console.log(`Block ${index} content:`, block.content)
          
          // Ensure content is properly structured
          let content = block.content
          
          // If content is a string, wrap it in the expected structure
          if (typeof content === 'string') {
            content = { text: content }
          }
          
          const transformedBlock = {
            block_type: block.type,
            content: content,
            position: index
          }
          
          console.log(`Transformed block ${index}:`, transformedBlock)
          return transformedBlock
        })
      }
      console.log('Final payload:', JSON.stringify(payload, null, 2))
      console.log('=== END DEBUG ===')
      
      await updateDraft.mutateAsync({
        draftId,
        data: payload
      })
      
      showToast({
        type: "success",
        title: "Draft saved",
        message: "Your changes have been saved",
      })
    } catch (error: any) {
      console.error("Failed to save draft:", error)
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        data: error.data
      })
      
      showToast({
        type: "error",
        title: "Failed to save draft",
        message: error.message || "Please try again",
      })
      
      throw error
    }
  }

  const handlePublish = async (data: any) => {
    try {
      await publishDraft.mutateAsync({
        draftId,
        data: {
          title: data.title,
          blocks: data.blocks,
          themes: data.themes,
          mood: data.mood
        }
      })
      router.push('/library')
    } catch (error) {
      console.error("Failed to publish chapter:", error)
      throw error
    }
  }

  const handleDelete = async () => {
    try {
      await deleteDraft.mutateAsync(draftId)
      router.push('/study')
    } catch (error) {
      console.error("Failed to delete draft:", error)
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AuthenticatedHeader title={COPY.NAV.STUDY} />
        <div className="flex-1 flex items-center justify-center">
          <LoadingState message="Loading draft..." />
        </div>
        <Footer />
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AuthenticatedHeader title={COPY.NAV.STUDY} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">Draft not found</p>
            <button
              onClick={() => router.push('/study')}
              className="text-primary hover:underline"
            >
              Back to Study
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <ChapterComposer
      initialBlocks={(draft.blocks || []).map((block: any) => ({
        id: block.id || Date.now().toString(),
        type: block.block_type,
        content: block.content,
        position: block.position
      }))}
      initialTitle={draft.title || ""}
      initialThemes={draft.themes || []}
      initialMood={draft.mood || ""}
      onSave={handleSave}
      onPublish={handlePublish}
      onDelete={handleDelete}
      mode="edit"
      isDraft={true}
    />
  )
}
