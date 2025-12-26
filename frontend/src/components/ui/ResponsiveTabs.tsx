"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

interface Tab {
  id: string
  label: string
  shortLabel?: string // For mobile
  priority?: number // Higher = more important (shown first on mobile)
}

interface ResponsiveTabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (tabId: string) => void
  className?: string
}

export function ResponsiveTabs({ tabs, activeTab, onChange, className = "" }: ResponsiveTabsProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [visibleTabs, setVisibleTabs] = useState<Tab[]>(tabs)
  const [overflowTabs, setOverflowTabs] = useState<Tab[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)
  const [needsOverflow, setNeedsOverflow] = useState(false)

  // Measure container width
  useEffect(() => {
    const measureWidth = () => {
      if (scrollContainerRef.current) {
        setContainerWidth(scrollContainerRef.current.offsetWidth)
      }
    }
    
    measureWidth()
    window.addEventListener('resize', measureWidth)
    return () => window.removeEventListener('resize', measureWidth)
  }, [])

  // Intelligently determine which tabs to show based on available space
  useEffect(() => {
    if (!containerWidth) return

    // Estimate space needed per tab (approximate)
    const estimatedTabWidth = 120 // Average width per tab with padding
    const moreButtonWidth = 60
    const availableSpace = containerWidth - moreButtonWidth
    const maxVisibleTabs = Math.floor(availableSpace / estimatedTabWidth)

    // Only use overflow if we truly need it
    if (tabs.length > maxVisibleTabs && maxVisibleTabs >= 3) {
      const sortedByPriority = [...tabs].sort((a, b) => 
        (b.priority || 0) - (a.priority || 0)
      )
      setVisibleTabs(sortedByPriority.slice(0, maxVisibleTabs))
      setOverflowTabs(sortedByPriority.slice(maxVisibleTabs))
      setNeedsOverflow(true)
    } else {
      setVisibleTabs(tabs)
      setOverflowTabs([])
      setNeedsOverflow(false)
    }
  }, [tabs, containerWidth])

  // Check scroll position for arrows (desktop only)
  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    setShowLeftArrow(container.scrollLeft > 10)
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    )
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll)
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [visibleTabs])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = 200
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  const handleTabClick = (tabId: string) => {
    onChange(tabId)
    setShowMoreMenu(false)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 z-10 p-2 bg-card/95 backdrop-blur-sm border-r border-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        {/* Tabs Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`py-4 border-b-2 transition-colors whitespace-nowrap font-serif flex-shrink-0 ${
                activeTab === tab.id
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.shortLabel || tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 z-10 p-2 bg-card/95 backdrop-blur-sm border-l border-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* More Menu (Only when needed) */}
        {needsOverflow && overflowTabs.length > 0 && (
          <div className="relative ml-4 flex-shrink-0">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`py-4 px-2 border-b-2 transition-colors whitespace-nowrap font-serif flex items-center gap-1 ${
                overflowTabs.some(t => t.id === activeTab)
                  ? 'border-primary text-foreground font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              aria-label="More tabs"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showMoreMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowMoreMenu(false)}
                  />
                  
                  {/* Menu */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-xl overflow-hidden min-w-[180px] z-30"
                  >
                    {overflowTabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => handleTabClick(tab.id)}
                        className={`w-full text-left px-4 py-3 text-sm font-serif transition-colors border-b border-border last:border-b-0 ${
                          activeTab === tab.id
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
