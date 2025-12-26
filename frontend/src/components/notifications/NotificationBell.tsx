"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useUnreadCount, useNotifications, useMarkAsRead } from "@/hooks/useNotifications"
import { motion, AnimatePresence } from "framer-motion"
import { COPY } from "@/constants/copy"

export function NotificationBell() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { data: unreadData } = useUnreadCount()
  const { data: notifications = [] } = useNotifications(undefined, true) // Only unread
  const markAsRead = useMarkAsRead()
  const unreadCount = unreadData?.count || 0

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMarkAsRead = (notificationId: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
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

  // Group notifications by type
  const groupedNotifications = notifications.reduce((acc: any, notification: any) => {
    const type = notification.notification_type
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(notification)
    return acc
  }, {})

  const typeLabels: Record<string, string> = {
    margin: COPY.NOTIFICATIONS.TYPES.MARGINS,
    shelf_add: COPY.NOTIFICATIONS.TYPES.SHELF,
    btl_reply: COPY.NOTIFICATIONS.TYPES.BTL,
    btl_invite: COPY.NOTIFICATIONS.TYPES.BTL_INVITE
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        variant="ghost" 
        size="sm"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg">🔔</span>
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">{COPY.NOTIFICATIONS.TITLE}</h3>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="text-3xl mb-2">🔔</div>
                  <p className="text-sm">{COPY.NOTIFICATIONS.EMPTY}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {Object.entries(groupedNotifications).map(([type, notifs]: [string, any]) => (
                    <div key={type}>
                      <div className="px-4 py-2 bg-muted/30">
                        <p className="text-xs font-semibold text-muted-foreground">
                          {typeLabels[type] || type}
                        </p>
                      </div>
                      {notifs.slice(0, 3).map((notification: any) => {
                        const link = getNotificationLink(notification)
                        return (
                          <div
                            key={notification.id}
                            className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => {
                              if (link) {
                                setIsOpen(false)
                                router.push(link)
                              }
                            }}
                          >
                            <p className="text-sm text-foreground mb-1 line-clamp-2">
                              {notification.message}
                            </p>
                            {notification.actor_username && (
                              <p className="text-xs text-muted-foreground mb-1">
                                from {notification.actor_username}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </p>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 text-xs"
                                onClick={(e) => handleMarkAsRead(notification.id, e)}
                              >
                                {COPY.NOTIFICATIONS.MARK_READ}
                              </Button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border bg-muted/30">
              <Link href="/notifications" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full">
                  {COPY.NOTIFICATIONS.VIEW_ALL}
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
