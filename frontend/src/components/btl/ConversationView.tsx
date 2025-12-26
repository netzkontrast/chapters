"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"

interface Message {
  id: number
  thread_id: number
  sender_id: number
  content: string
  created_at: string
}

interface ConversationViewProps {
  threadId: number
  otherUserId: number
  otherUserName?: string
  messages: Message[]
  currentUserId: number
  onSendMessage: (content: string) => Promise<void>
  onClose: () => void
  onBlock: () => void
  onReport: () => void
  isClosed?: boolean
}

export function ConversationView({
  threadId,
  otherUserId,
  otherUserName = "Someone",
  messages,
  currentUserId,
  onSendMessage,
  onClose,
  onBlock,
  onReport,
  isClosed = false,
}: ConversationViewProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px"
    }
  }, [newMessage])

  const handleSend = async () => {
    if (!newMessage.trim() || isSending || isClosed) return

    setIsSending(true)
    try {
      await onSendMessage(newMessage)
      setNewMessage("")
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, Message[]>)

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-serif font-semibold text-foreground">
              Between the Lines
            </h2>
            <p className="text-sm text-muted-foreground">
              with {otherUserName}
              {isClosed && <span className="ml-2 text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Closed</span>}
            </p>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMenu(!showMenu)}
              className="text-muted-foreground hover:text-foreground"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </Button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border py-1 z-10"
                >
                  {!isClosed && (
                    <button
                      onClick={() => {
                        onClose()
                        setShowMenu(false)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                    >
                      Close Space
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onReport()
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                  >
                    Report
                  </button>
                  <button
                    onClick={() => {
                      onBlock()
                      setShowMenu(false)
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    Block User
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">📖</div>
            <p className="text-foreground font-serif text-lg mb-2">
              This is the beginning of your conversation
            </p>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Share your thoughts, ask questions, connect. This space is private and intentional.
            </p>
          </motion.div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-3">
              {/* Date divider */}
              <div className="flex items-center justify-center my-6">
                <div className="bg-card/80 backdrop-blur-sm px-4 py-1 rounded-full border border-border">
                  <p className="text-xs text-muted-foreground font-medium">
                    {new Date(date).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: new Date(date).getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
                    })}
                  </p>
                </div>
              </div>
              
              {/* Messages for this date */}
              {dateMessages.map((message, index) => {
                const isOwn = message.sender_id === currentUserId
                const prevMessage = index > 0 ? dateMessages[index - 1] : null
                const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id
                
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"} ${!showAvatar && "mt-1"}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
                      {/* Avatar placeholder */}
                      {showAvatar && (
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-medium ${
                          isOwn ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                        }`}>
                          {isOwn ? "You" : otherUserName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {!showAvatar && <div className="w-8" />}
                      
                      {/* Message bubble */}
                      <div className="flex flex-col gap-1">
                        <div
                          className={`rounded-2xl px-4 py-3 ${
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-card text-foreground border border-border rounded-bl-sm shadow-sm"
                          }`}
                        >
                          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        </div>
                        {showAvatar && (
                          <p className={`text-[11px] text-muted-foreground px-2 ${isOwn ? "text-right" : "text-left"}`}>
                            {new Date(message.created_at).toLocaleTimeString(undefined, {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border px-6 py-4 bg-card/80 backdrop-blur-sm">
        {isClosed ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground font-serif">
              This conversation has been closed
            </p>
          </div>
        ) : (
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value.slice(0, 1000))}
                onKeyPress={handleKeyPress}
                placeholder="Write a reply..."
                rows={1}
                className="w-full max-h-32 px-4 py-3 bg-background border border-border rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <p className="absolute bottom-1 right-3 text-[10px] text-muted-foreground">
                {newMessage.length}/1000
              </p>
            </div>
            <Button
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {isSending ? (
                <div className="animate-spin h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
