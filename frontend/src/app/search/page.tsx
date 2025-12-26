"use client"

import { Suspense, useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SearchBar } from "@/components/search/SearchBar"
import { LoadingState } from "@/components/LoadingState"
import { useSearch } from "@/hooks/useSearch"
import { motion } from "framer-motion"
import { Footer } from "@/components/Footer"
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader"

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [page, setPage] = useState(1)

  const { data: results, isLoading } = useSearch(query, page)

  useEffect(() => {
    setPage(1)
  }, [query])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-background flex flex-col"
    >
      <AuthenticatedHeader title="Search" />

      <div className="container mx-auto px-4 py-8 max-w-4xl flex-1">
        <div className="max-w-2xl mb-8">
          <SearchBar />
        </div>
        {!query ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg text-muted-foreground mb-2">
              Search for ideas, moods, or questions.
            </p>
            <p className="text-sm text-muted-foreground">
              People appear after you read.
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <LoadingState message="Searching..." />
          </div>
        ) : results && results.chapters.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">
                {results.total} {results.total === 1 ? 'chapter' : 'chapters'} for "{query}"
              </p>
            </div>

            <div className="space-y-6">
              {results.chapters.map((chapter, index) => (
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

                    {/* Themes */}
                    {chapter.themes.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {chapter.themes.map((theme) => (
                          <span
                            key={theme}
                            className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                          >
                            {theme}
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
            {(page > 1 || results.has_more) && (
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
                {results.has_more && (
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
            <div className="text-5xl mb-4">📖</div>
            <p className="text-lg text-muted-foreground mb-2">
              No chapters found for "{query}"
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Try different words or browse themes
            </p>
            <Button onClick={() => router.push('/themes')}>
              Browse Themes
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </motion.div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState message="Loading search..." />}>
      <SearchContent />
    </Suspense>
  )
}
