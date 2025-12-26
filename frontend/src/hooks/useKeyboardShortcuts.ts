/**
 * Keyboard Shortcuts Hook
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useKeyboardShortcuts() {
  const router = useRouter()

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Cmd/Ctrl + K - Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        router.push('/search')
      }

      // G then L - Go to Library
      if (e.key === 'g') {
        const handleSecondKey = (e2: KeyboardEvent) => {
          if (e2.key === 'l') {
            router.push('/library')
          } else if (e2.key === 's') {
            router.push('/study')
          } else if (e2.key === 't') {
            router.push('/themes')
          } else if (e2.key === 'c') {
            router.push('/conversations')
          }
          window.removeEventListener('keydown', handleSecondKey)
        }
        window.addEventListener('keydown', handleSecondKey)
        setTimeout(() => {
          window.removeEventListener('keydown', handleSecondKey)
        }, 1000)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [router])
}
