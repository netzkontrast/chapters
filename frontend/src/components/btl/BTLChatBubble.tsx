"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Minimize2 } from "lucide-react"
import { useThreads } from "@/hooks/useBTL"
import { useUser } from "@/hooks/useUser"
import Link from "next/link"
import { COPY } from "@/constants/copy"

interface BTLChatBubbleProps {
  enabled: boolean
}

export function BTLChatBubble({ enabled }: BTLChatBubbleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { data: threads = [], isLoading: threadsLoading } = useThreads()
  const { data: user } = useUser()

  // Wait for client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render on server
  if (!mounted) {
    return null
  }

  // Don't show if not enabled
  if (!enabled) {
    return null
  }

  // Check authentication - show if user data exists OR if there's an auth token
  const hasAuthToken = typeof document !== 'undefined' && 
    document.cookie.split('; ').find(row => row.startsWith('auth_token='))
  
  const isAuthenticated = !!user || !!hasAuthToken

  // Don't show if not authenticated
  if (!isAuthenticated) {
    return null
  }

  const unreadCount = threads.filter((t: any) => t.unread_count > 0).length

  return (
    <>
      {/* Chat Bubble Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <MessageCircle className="h-6 w-6" />
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center"
              >
                {unreadCount}
              </motion.div>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-card border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-card">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <h3 className="font-serif font-semibold text-foreground">
                  {COPY.BTL.TITLE}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                >
                  <Minimize2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {threadsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm text-muted-foreground">
                    {COPY.LOADING.BTL}
                  </div>
                </div>
              ) : threads.length > 0 ? (
                <div className="space-y-2">
                  {threads.map((thread: any) => (
                    <Link
                      key={thread.id}
                      href={`/conversations/${thread.id}`}
                      onClick={() => setIsOpen(false)}
                      className="block bg-background border border-border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {thread.other_user_username || "Someone"}
                          </p>
                          {thread.last_message && (
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {thread.last_message}
                            </p>
                          )}
                        </div>
                        {thread.unread_count > 0 && (
                          <div className="flex-shrink-0 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                            {thread.unread_count}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {thread.status === 'closed' ? COPY.MISC.CLOSED : ''}
                        </span>
                        {thread.updated_at && (
                          <span>
                            {new Date(thread.updated_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="text-5xl mb-4">💬</div>
                  <h4 className="text-lg font-serif font-semibold text-foreground mb-2">
                    {COPY.EMPTY_STATES.BTL.TITLE}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {COPY.EMPTY_STATES.BTL.BODY}
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border bg-card">
              <Link
                href="/conversations"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-primary hover:underline"
              >
                View all conversations →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Minimized State */}
      <AnimatePresence>
        {isOpen && isMinimized && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsMinimized(false)}
            className="fixed bottom-6 right-6 z-50 bg-card border border-border rounded-lg px-4 py-3 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-3"
          >
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="font-medium text-foreground">{COPY.BTL.TITLE}</span>
            {unreadCount > 0 && (
              <div className="bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </div>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
