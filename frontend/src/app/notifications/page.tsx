"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/LoadingState"
import { useNotifications, useMarkAsRead } from "@/hooks/useNotifications"
import { NotificationType } from "@/services/notifications"
import { motion } from "framer-motion"
import { Footer } from "@/components/Footer"
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader"
import { COPY } from "@/constants/copy"

export default function NotificationsPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<NotificationType | undefined>(undefined)
  
  const { data: notifications = [], isLoading } = useNotifications(filter, false)
  const markAsRead = useMarkAsRead()

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead.mutate(notificationId)
  }

  const getNotificationLink = (notification: any) => {
    if (notification.chapter_id) {
      return `/chapters/${notification.chapter_id}`
    }
    if (notification.btl_thread_id) {
      return `/conversations/${notification.btl_thread_id}`
    }
    if (notification.btl_invite_id) {
      return `/conversations`
    }
    return null
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthenticatedHeader title={COPY.NOTIFICATIONS.TITLE} />

      {/* Tabs */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-8 overflow-x-auto">
              <button
                onClick={() => setFilter(undefined)}
                className={`py-4 border-b-2 transition-colors whitespace-nowrap ${
                  filter === undefined
                    ? 'border-primary text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {COPY.NOTIFICATIONS.ALL}
              </button>
              <button
                onClick={() => setFilter('margin')}
                className={`py-4 border-b-2 transition-colors whitespace-nowrap ${
                  filter === 'margin'
                    ? 'border-primary text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Margins
              </button>
              <button
                onClick={() => setFilter('shelf_add')}
                className={`py-4 border-b-2 transition-colors whitespace-nowrap ${
                  filter === 'shelf_add'
                    ? 'border-primary text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Shelf
              </button>
              <button
                onClick={() => setFilter('btl_reply')}
                className={`py-4 border-b-2 transition-colors whitespace-nowrap ${
                  filter === 'btl_reply' || filter === 'btl_invite'
                    ? 'border-primary text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Conversations
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        {isLoading ? (
          <div className="text-center py-16">
            <LoadingState message={COPY.LOADING.DEFAULT} />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-lg">
            <div className="text-5xl mb-4">🔔</div>
            <p className="text-lg text-muted-foreground mb-2">
              {COPY.NOTIFICATIONS.EMPTY}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              You'll be notified when someone leaves a margin, adds your Book to their Shelf, or replies between the lines.
            </p>
            <Button onClick={() => router.push('/library')}>
              {COPY.BUTTONS.BACK_TO_LIBRARY}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const link = getNotificationLink(notification)
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.2 }}
                  className={`bg-card border rounded-lg p-4 transition-all ${
                    notification.read 
                      ? 'border-border opacity-70' 
                      : 'border-primary/30 bg-primary/5'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <p className="text-foreground mb-2 leading-relaxed">
                        {notification.message}
                      </p>
                      {notification.chapter_title && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Chapter: {notification.chapter_title}
                        </p>
                      )}
                      {notification.actor_username && (
                        <p className="text-sm text-muted-foreground mb-2">
                          from {notification.actor_username}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {link && (
                        <Link href={link}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      )}
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          {COPY.NOTIFICATIONS.MARK_READ}
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
