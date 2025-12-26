"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LoadingState } from "@/components/LoadingState"
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader"
import { useThemeChapters } from "@/hooks/useSearch"
import { motion } from "framer-motion"
import { Footer } from "@/components/Footer"

export default function ThemePage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string
  const [page, setPage] = useState(1)

  const { data: themeData, isLoading } = useThemeChapters(slug, page)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Loading theme..." />
      </div>
    )
  }

  if (!themeData) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AuthenticatedHeader title="Theme" />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">Theme not found</p>
            <Button onClick={() => router.push('/discover')}>
              Back to Discover
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const { theme, chapters } = themeData

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AuthenticatedHeader title={theme.name} />

      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <div className="mb-6 flex items-center gap-3">
          {theme.emoji && (
            <span className="text-4xl">{theme.emoji}</span>
          )}
          <div>
            {theme.description && (
              <p className="text-muted-foreground mb-2">{theme.description}</p>
            )}
            <p className="text-sm text-muted-foreground">
              {theme.chapter_count} {theme.chapter_count === 1 ? 'chapter' : 'chapters'}
            </p>
          </div>
        </div>

        {chapters.length > 0 ? (
          <>
            <div className="space-y-6">
              {chapters.map((chapter, index) => (
                <motion.div
                  key={chapter.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.2 }}
                >
                  <Link
                    href={`/chapters/${chapter.id}`}
                    className="block bg-card border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all"
                  >
                    {/* Chapter Title */}
                    {chapter.title && (
                      <h3 className="text-xl font-serif font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                        {chapter.title}
                      </h3>
                    )}

                    {/* Mood */}
                    {chapter.mood && (
                      <p className="text-sm text-muted-foreground italic mb-3">
                        {chapter.mood}
                      </p>
                    )}

                    {/* Excerpt */}
                    {chapter.excerpt && (
                      <p className="text-foreground leading-relaxed mb-4 line-clamp-3">
                        {chapter.excerpt}
                      </p>
                    )}

                    {/* Other Themes */}
                    {chapter.themes.length > 1 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {chapter.themes
                          .filter(t => t !== theme.name)
                          .map((themeName) => (
                            <span
                              key={themeName}
                              className="text-xs px-2 py-1 bg-muted text-muted-foreground rounded-full"
                            >
                              {themeName}
                            </span>
                          ))}
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>by {chapter.author_username}</span>
                      <span>•</span>
                      <span>{new Date(chapter.published_at).toLocaleDateString()}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {(page > 1 || themeData.has_more) && (
              <div className="flex items-center justify-center gap-4 mt-8">
                {page > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Previous
                  </Button>
                )}
                <span className="text-sm text-muted-foreground">
                  Page {page}
                </span>
                {themeData.has_more && (
                  <Button
                    variant="outline"
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next →
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">{theme.emoji || '📖'}</div>
            <p className="text-lg text-muted-foreground mb-2">
              No chapters yet for {theme.name}
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Chapters with this theme will appear here
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
