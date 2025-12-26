"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { createContext, useContext, useState, useCallback, ReactNode } from "react"

export type ToastType = "success" | "error" | "info" | "warning"

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (toast: Omit<Toast, "id">) => void
  hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { ...toast, id }
    
    setToasts((prev) => [...prev, newToast])

    // Auto-dismiss after duration (default 5 seconds)
    const duration = toast.duration || 5000
    setTimeout(() => {
      hideToast(id)
    }, duration)
  }, [])

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: (id: string) => void }) {
  const emojis = {
    success: "✨",
    error: "⚠️",
    warning: "💭",
    info: "📖",
  }

  const styles = {
    success: "bg-card dark:bg-card border-border text-foreground shadow-md",
    error: "bg-card dark:bg-card border-border text-foreground shadow-md",
    warning: "bg-card dark:bg-card border-border text-foreground shadow-md",
    info: "bg-card dark:bg-card border-border text-foreground shadow-md",
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`pointer-events-auto min-w-[320px] max-w-md rounded-lg border-2 p-4 ${styles[toast.type]}`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl flex-shrink-0">{emojis[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="font-serif font-semibold text-sm mb-0.5">{toast.title}</p>
          {toast.message && (
            <p className="text-sm text-muted-foreground">{toast.message}</p>
          )}
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}
