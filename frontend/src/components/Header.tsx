"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Logo } from "@/components/Logo"
import { motion, AnimatePresence } from "framer-motion"

export function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Don't show header on authenticated pages (they have their own headers)
  // Add safety check for pathname
  if (!pathname) return null
  
  const hideHeader = 
    pathname.startsWith("/library") || 
    pathname.startsWith("/study") ||
    pathname.startsWith("/preferences") ||
    pathname.startsWith("/books") ||
    pathname.startsWith("/chapters") ||
    pathname.startsWith("/conversations") ||
    pathname.startsWith("/notifications")

  if (hideHeader) return null

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 border-b border-border bg-card transition-shadow duration-300 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <Logo size={32} className="transition-transform duration-300 group-hover:scale-105" />
            <span className="text-2xl font-serif font-bold text-foreground transition-transform duration-300 group-hover:scale-105">
              Chapters
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative pb-1"
            >
              <span className="relative">
                About
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </span>
            </Link>
            <Link
              href="/muse"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative pb-1"
            >
              <span className="relative">
                Meet Muse
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </span>
            </Link>
            <Link
              href="/library"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300 relative pb-1"
            >
              <span className="relative">
                Library
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
              </span>
            </Link>
          </div>

          {/* Auth Buttons + Theme Toggle */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Link href="/auth/login">
              <Button
                variant="ghost"
                size="sm"
                className="transition-all duration-300 hover:scale-105"
              >
                Login
              </Button>
            </Link>
            <Link href="/auth/register">
              <Button
                size="sm"
                className="transition-all duration-300 hover:scale-105 hover:shadow-md"
              >
                Start Your Book
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground hover:bg-muted rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border overflow-hidden mt-4"
            >
              <div className="py-4 space-y-2">
                <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-muted hover:text-foreground">
                    About
                  </Button>
                </Link>
                <Link href="/muse" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-muted hover:text-foreground">
                    Meet Muse
                  </Button>
                </Link>
                <Link href="/library" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-muted hover:text-foreground">
                    Library
                  </Button>
                </Link>
                <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-start hover:bg-muted hover:text-foreground">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Start Your Book
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
}
