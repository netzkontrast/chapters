"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { NotificationBell } from "@/components/notifications/NotificationBell"
import { authService } from "@/services/auth"
import { COPY } from "@/constants/copy"
import { Menu, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface AuthenticatedHeaderProps {
  title: string
}

export function AuthenticatedHeader({ title }: AuthenticatedHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      console.debug('Logout completed')
    } finally {
      router.push("/")
    }
  }

  const isActive = (path: string) => {
    return pathname.startsWith(path)
  }

  const navLinks = [
    { href: '/library', label: COPY.NAV.LIBRARY },
    { href: '/study', label: COPY.NAV.STUDY },
    { href: '/conversations', label: COPY.NAV.BTL },
    { href: '/preferences', label: COPY.NAV.PREFERENCES },
  ]

  return (
    <header className="border-b border-border bg-card sticky top-0 z-10">
      <div className="container mx-auto px-4">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between pt-4">
          <h1 className="text-2xl font-serif font-bold text-foreground pb-4">
            {title}
          </h1>
          <div className="flex items-center gap-1">
            {/* Navigation Links with Tab Style */}
            <nav className="flex items-center gap-1 mr-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <button
                    className={`
                      px-4 py-4 font-serif text-base transition-colors border-b-2
                      ${isActive(link.href)
                        ? 'text-foreground font-semibold border-primary'
                        : 'text-muted-foreground hover:text-foreground border-transparent'
                      }
                    `}
                  >
                    {link.label}
                  </button>
                </Link>
              ))}
            </nav>

            {/* Utility Actions */}
            <div className="flex items-center gap-2 pl-4 border-l border-border h-12">
              <ThemeToggle />
              <NotificationBell />
              <Button variant="outline" size="sm" onClick={handleLogout}>
                {COPY.NAV.LOGOUT}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between py-4">
          <h1 className="text-xl font-serif font-bold text-foreground">
            {title}
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <NotificationBell />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-foreground hover:bg-muted rounded-md transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
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
              className="md:hidden border-t border-border overflow-hidden"
            >
              <nav className="py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <button
                      className={`
                        w-full text-left px-4 py-3 font-serif transition-colors rounded-md
                        ${isActive(link.href)
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }
                      `}
                    >
                      {link.label}
                    </button>
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="w-full text-left px-4 py-3 font-serif text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-md"
                >
                  {COPY.NAV.LOGOUT}
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
