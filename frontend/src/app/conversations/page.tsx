"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ConfirmModal } from "@/components/ui/ConfirmModal"
import { LoadingState } from "@/components/LoadingState"
import { useThreads, usePendingInvites, useAcceptInvite, useDeclineInvite } from "@/hooks/useBTL"
import { useUser } from "@/hooks/useUser"
import { motion, AnimatePresence } from "framer-motion"
import { Footer } from "@/components/Footer"
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader"
import { TabTransition } from "@/components/PageTransition"
import { COPY } from "@/constants/copy"
import { UnifiedSearchBar } from "@/components/search/UnifiedSearchBar"
import { ResponsiveTabs } from "@/components/ui/ResponsiveTabs"

export default function ConversationsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'archived'>('all')
  const [searchQuery, setSearchQuery] = useState("")
  const [declineModalOpen, setDeclineModalOpen] = useState(false)
  const [inviteToDecline, setInviteToDecline] = useState<number | null>(null)
  
  const { data: currentUser } = useUser()
  const { data: threads = [], isLoading: threadsLoading } = useThreads()
  const { data: invites = [], isLoading: invitesLoading } = usePendingInvites()
  const acceptInvite = useAcceptInvite()
  const declineInvite = useDeclineInvite()

  const handleAccept = async (inviteId: number) => {
    try {
      const thread = await acceptInvite.mutateAsync(inviteId)
      router.push(`/conversations/${thread.id}`)
    } catch (error) {
      console.error("Failed to accept invite:", error)
    }
  }

  const handleDeclineClick = (inviteId: number) => {
    setInviteToDecline(inviteId)
    setDeclineModalOpen(true)
  }

  const handleConfirmDecline = async () => {
    if (inviteToDecline === null) return
    
    try {
      await declineInvite.mutateAsync(inviteToDecline)
      setDeclineModalOpen(false)
      setInviteToDecline(null)
    } catch (error) {
      console.error("Failed to decline invite:", error)
    }
  }

  // Filter threads based on search query
  const filteredThreads = threads.filter(thread => {
    if (!searchQuery) return true
    // Search by thread ID or any other relevant fields
    return thread.id.toString().includes(searchQuery)
  })

  if (threadsLoading || invitesLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message={COPY.LOADING.BTL} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthenticatedHeader title={COPY.BTL.TITLE} />

      {/* Search Bar Section */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <UnifiedSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search conversations..."
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <ResponsiveTabs
            tabs={[
              { id: 'all', label: 'All', priority: 3 },
              { id: 'unread', label: 'Unread', priority: 2 },
              { id: 'archived', label: 'Archived', priority: 1 },
            ]}
            activeTab={activeTab}
            onChange={(tab) => setActiveTab(tab as 'all' | 'unread' | 'archived')}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <AnimatePresence mode="wait">
          <TabTransition key={activeTab}>
        {/* Pending Invites */}
        {invites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
              {COPY.BTL.PENDING_INVITES}
            </h2>
            <div className="space-y-4">
              {invites.map((invite) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-card border border-border rounded-lg p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">
                        {new Date(invite.created_at).toLocaleDateString()}
                      </p>
                      {invite.note && (
                        <p className="text-foreground mb-3 leading-relaxed">
                          {invite.note}
                        </p>
                      )}
                      {invite.quoted_line && (
                        <blockquote className="border-l-4 border-primary/30 pl-4 py-2 bg-primary/5 rounded-r">
                          <p className="text-sm italic text-foreground">
                            &quot;{invite.quoted_line}&quot;
                          </p>
                        </blockquote>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAccept(invite.id)}
                      disabled={acceptInvite.isPending}
                      size="sm"
                    >
                      {COPY.BTL.ACCEPT}
                    </Button>
                    <Button
                      onClick={() => handleDeclineClick(invite.id)}
                      disabled={declineInvite.isPending}
                      variant="outline"
                      size="sm"
                    >
                      {COPY.BTL.DECLINE}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Active Threads */}
        <div>
          <h2 className="text-xl font-serif font-semibold text-foreground mb-4">
            {COPY.BTL.YOUR_CONVERSATIONS}
          </h2>
          
          {filteredThreads.length === 0 ? (
            <div className="text-center py-16 bg-card border border-border rounded-lg">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-lg text-muted-foreground mb-2">
                {searchQuery ? "No conversations found" : COPY.EMPTY_STATES.BTL.TITLE}
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                {searchQuery 
                  ? "Try a different search term" 
                  : COPY.BTL.SEND_INVITATION
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push('/library')}>
                  {COPY.BUTTONS.EXPLORE_LIBRARY}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredThreads.map((thread) => {
                const otherUserId = thread.participant1_id === currentUser?.id 
                  ? thread.participant2_id 
                  : thread.participant1_id
                
                return (
                  <motion.button
                    key={thread.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => router.push(`/conversations/${thread.id}`)}
                    className="w-full bg-card border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-foreground font-medium mb-2">
                          Conversation #{thread.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Started {new Date(thread.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {thread.status === 'closed' && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {COPY.MISC.CLOSED}
                        </span>
                      )}
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>
          </TabTransition>
        </AnimatePresence>
      </div>

      <ConfirmModal
        isOpen={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        onConfirm={handleConfirmDecline}
        title="Decline Invitation"
        message="Are you sure you want to decline this invitation? This cannot be undone."
        confirmText="Decline"
        cancelText="Keep Invitation"
        variant="warning"
        isLoading={declineInvite.isPending}
      />

      <Footer />
    </div>
  )
}
