"use client"

import { useRouter, useParams } from "next/navigation"
import { ConversationView } from "@/components/btl/ConversationView"
import { useThreadMessages, useSendMessage, useCloseThread, useThreads } from "@/hooks/useBTL"
import { useUser } from "@/hooks/useUser"
import { LoadingState } from "@/components/LoadingState"
import { BTLThread } from "@/services/btl"
import { useToast } from "@/components/ui/toast"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { useState } from "react"

export default function ConversationPage() {
  const router = useRouter()
  const params = useParams()
  const { showToast } = useToast()
  const threadId = parseInt(params.id as string)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const { data: currentUser } = useUser()
  const { data: threads = [] } = useThreads()
  const { data: messages = [], isLoading } = useThreadMessages(threadId)
  const sendMessage = useSendMessage()
  const closeThread = useCloseThread()

  const thread = threads.find((t: BTLThread) => t.id === threadId)
  const otherUserId = thread 
    ? (thread.participant1_id === currentUser?.id ? thread.participant2_id : thread.participant1_id)
    : null
  
  // For now, use "Someone" as placeholder - names would need to be fetched separately
  const otherUserName = "Someone"

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage.mutateAsync({ threadId, content })
    } catch (error) {
      console.error("Failed to send message:", error)
      showToast({
        type: "error",
        title: "Failed to send message",
        message: "Please try again",
      })
    }
  }

  const handleClose = async () => {
    setIsClosing(true)
    try {
      await closeThread.mutateAsync(threadId)
      showToast({
        type: "success",
        title: "Conversation closed",
        message: "This space has been closed",
      })
      router.push("/conversations")
    } catch (error) {
      console.error("Failed to close conversation:", error)
      showToast({
        type: "error",
        title: "Failed to close conversation",
        message: "Please try again",
      })
      setIsClosing(false)
    }
  }

  const handleBlock = async () => {
    // TODO: Implement block functionality
    showToast({
      type: "info",
      title: "Coming soon",
      message: "Block functionality will be available soon",
    })
    setShowBlockModal(false)
  }

  const handleReport = async () => {
    // TODO: Implement report functionality
    showToast({
      type: "success",
      title: "Report submitted",
      message: "Thank you for your report. We'll review it shortly.",
    })
    setShowReportModal(false)
  }

  if (isLoading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <LoadingState message="Loading conversation..." />
      </div>
    )
  }

  if (!thread) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Conversation not found</p>
          <button
            onClick={() => router.push("/conversations")}
            className="text-primary hover:underline"
          >
            Back to conversations
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-background">
      <ConversationView
        threadId={threadId}
        otherUserId={otherUserId || 0}
        otherUserName={otherUserName}
        messages={messages}
        currentUserId={currentUser?.id || 0}
        onSendMessage={handleSendMessage}
        onClose={() => setShowCloseModal(true)}
        onBlock={() => setShowBlockModal(true)}
        onReport={() => setShowReportModal(true)}
        isClosed={thread.status === 'closed'}
      />

      {/* Close Confirmation Modal */}
      <ConfirmModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={handleClose}
        title="Close Conversation"
        message="Are you sure you want to close this space? This cannot be undone."
        confirmText="Close Space"
        cancelText="Keep Open"
        variant="warning"
        isLoading={isClosing}
      />

      {/* Block Confirmation Modal */}
      <ConfirmModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlock}
        title="Block User"
        message="Are you sure you want to block this user? They won't be able to contact you again."
        confirmText="Block User"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Report Confirmation Modal */}
      <ConfirmModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onConfirm={handleReport}
        title="Report Conversation"
        message="Report this conversation for violating community guidelines?"
        confirmText="Submit Report"
        cancelText="Cancel"
        variant="warning"
      />
    </div>
  )
}
