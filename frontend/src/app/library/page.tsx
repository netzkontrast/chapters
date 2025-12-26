"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PageTransition, TabTransition } from "@/components/PageTransition"
import { LoadingState } from "@/components/LoadingState"
import { useBookshelf, useNewChapters, useQuietPicks } from "@/hooks/useLibrary"
import { useSpines } from "@/hooks/useSpines"
import { useThemes } from "@/hooks/useSearch"
import { useQuery } from "@tanstack/react-query"
import { chaptersService } from "@/services/chapters"
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"
import { AnimatePresence, motion } from "framer-motion"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { AuthenticatedHeader } from "@/components/AuthenticatedHeader"
import { UnifiedSearchBar } from "@/components/search/UnifiedSearchBar"
import { COPY } from "@/constants/copy"
import { useToast } from "@/components/ui/toast"
import { ResponsiveTabs } from "@/components/ui/ResponsiveTabs"

type PublicTab = 'chapters' | 'books-spines' | 'themes'
type AuthTab = 'bookshelf' | 'new' | 'picks' | 'books-spines' | 'themes'

export default function LibraryPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [hasShownGuestToast, setHasShownGuestToast] = useState(false)
  
  // Public state
  const [publicTab, setPublicTab] = useState<PublicTab>('chapters')
  const [publicChaptersPage, setPublicChaptersPage] = useState(1)
  
  // Auth state
  const [authTab, setAuthTab] = useState<AuthTab>('bookshelf')
  const [newChaptersPage, setNewChaptersPage] = useState(1)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("")
  
  const perPage = 20

  useKeyboardShortcuts()

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const token = document.cookie.split('; ').find(row => row.startsWith('auth_token='))
      setIsAuthenticated(!!token)
      setIsCheckingAuth(false)
    }
    checkAuth()
  }, [])

  // Show welcome toast for guests
  useEffect(() => {
    if (!isCheckingAuth && !isAuthenticated && !hasShownGuestToast) {
      setHasShownGuestToast(true)
      showToast({
        type: "info",
        title: COPY.MISC.GUEST_WELCOME_TITLE,
        message: COPY.MISC.GUEST_WELCOME_MESSAGE,
      })
    }
  }, [isCheckingAuth, isAuthenticated, hasShownGuestToast, showToast])

  // Public data fetching
  const { data: publicChapters, isLoading: publicChaptersLoading } = useQuery({
    queryKey: ['public-chapters', publicChaptersPage],
    queryFn: async () => {
      const response = await chaptersService.listChapters({ page: publicChaptersPage, per_page: perPage })
      return response
    },
    enabled: !isCheckingAuth && !isAuthenticated
  })

  // Authenticated data fetching
  const { data: bookshelf, isLoading: bookshelfLoading } = useBookshelf()
  const { data: newChapters, isLoading: newChaptersLoading } = useNewChapters(newChaptersPage)
  const { data: quietPicks, isLoading: quietPicksLoading } = useQuietPicks()
  
  // Shared data (both public and auth)
  const { data: spines, isLoading: spinesLoading } = useSpines()
  const { data: themes, isLoading: themesLoading } = useThemes()

  // Filter data based on search
  const filteredPublicChapters = publicChapters?.chapters?.filter((chapter: any) =>
    searchQuery === "" ||
    chapter.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chapter.author?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chapter.mood?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSpines = spines?.filter((spine: any) =>
    searchQuery === "" ||
    spine.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spine.author_username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredThemes = themes?.filter(theme =>
    searchQuery === "" ||
    theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    theme.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const publicChaptersTotalPages = publicChapters ? Math.ceil(publicChapters.total / perPage) : 1
  const publicChaptersHasMore = publicChaptersPage < publicChaptersTotalPages

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message={COPY.LOADING.DEFAULT} />
      </div>
    )
  }

  const activeTab = isAuthenticated ? authTab : publicTab
  const setActiveTab = isAuthenticated 
    ? (tab: string) => setAuthTab(tab as AuthTab)
    : (tab: string) => setPublicTab(tab as PublicTab)

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        {isAuthenticated ? (
          <AuthenticatedHeader title={COPY.NAV.LIBRARY} />
        ) : (
          <>
            <Header />
            <div className="h-20" />
          </>
        )}

        {/* Search Bar Section */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <UnifiedSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={
                activeTab === 'chapters' ? 'Search chapters...' :
                activeTab === 'books-spines' ? 'Search books...' :
                activeTab === 'themes' ? 'Search themes...' :
                activeTab === 'bookshelf' ? 'Search your shelf...' :
                activeTab === 'new' ? 'Search new chapters...' :
                activeTab === 'picks' ? 'Search picks...' :
                'Search...'
              }
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4">
            {!isAuthenticated ? (
              <ResponsiveTabs
                tabs={[
                  { id: 'chapters', label: COPY.TABS.CHAPTERS, priority: 3 },
                  { id: 'books-spines', label: COPY.TABS.BOOKS_SPINES, shortLabel: 'Books', priority: 2 },
                  { id: 'themes', label: COPY.TABS.THEMES, priority: 1 },
                ]}
                activeTab={publicTab}
                onChange={(tab) => setPublicTab(tab as PublicTab)}
              />
            ) : (
              <ResponsiveTabs
                tabs={[
                  { id: 'bookshelf', label: COPY.TABS.SHELF, shortLabel: 'Shelf', priority: 5 },
                  { id: 'new', label: COPY.TABS.NEW_CHAPTERS, shortLabel: 'Chapters', priority: 4 },
                  { id: 'picks', label: COPY.TABS.QUIET_PICKS, shortLabel: 'Picks', priority: 3 },
                  { id: 'books-spines', label: COPY.TABS.BOOKS_SPINES, shortLabel: 'Books', priority: 2 },
                  { id: 'themes', label: COPY.TABS.THEMES, priority: 1 },
                ]}
                activeTab={authTab}
                onChange={(tab) => setAuthTab(tab as AuthTab)}
              />
            )}
          </div>
        </div>

        {/* Content */}
        <main className="container mx-auto px-4 py-12 flex-1">
          <AnimatePresence mode="wait">
            {/* PUBLIC: Chapters Tab */}
            {!isAuthenticated && activeTab === 'chapters' && (
              <TabTransition key="public-chapters">
                <div className="max-w-4xl mx-auto">
                  {publicChaptersLoading ? (
                    <LoadingState message={COPY.LOADING.CHAPTERS} />
                  ) : filteredPublicChapters && filteredPublicChapters.length > 0 ? (
                    <>
                      <div className="space-y-6">
                        {filteredPublicChapters.map((chapter: any, index: number) => (
                          <motion.div
                            key={chapter.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: index * 0.02 }}
                          >
                            <Link
                              href={`/chapters/${chapter.id}`}
                              className="block bg-card border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all group"
                            >
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <h3 className="text-xl font-serif font-semibold text-foreground group-hover:text-primary transition-colors flex-1">
                                  {chapter.title}
                                </h3>
                                <span className="text-sm text-muted-foreground whitespace-nowrap">
                                  {new Date(chapter.published_at).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <span>
                                  by <span className="font-medium text-foreground">{chapter.author?.username || 'Unknown'}</span>
                                </span>
                                {chapter.mood && (
                                  <span className="text-primary italic">
                                    {chapter.mood}
                                  </span>
                                )}
                              </div>

                              {chapter.blocks && chapter.blocks.length > 0 && chapter.blocks[0].block_type === 'text' && (
                                <p className="text-muted-foreground line-clamp-2">
                                  {chapter.blocks[0].content?.text?.substring(0, 150)}...
                                </p>
                              )}
                            </Link>
                          </motion.div>
                        ))}
                      </div>

                      {/* Pagination */}
                      {(publicChaptersPage > 1 || publicChaptersHasMore) && (
                        <div className="flex items-center justify-center gap-4 mt-12">
                          {publicChaptersPage > 1 && (
                            <Button
                              variant="outline"
                              onClick={() => setPublicChaptersPage(p => p - 1)}
                            >
                              ← Previous
                            </Button>
                          )}
                          <span className="text-sm text-muted-foreground">
                            Page {publicChaptersPage} of {publicChaptersTotalPages}
                          </span>
                          {publicChaptersHasMore && (
                            <Button
                              variant="outline"
                              onClick={() => setPublicChaptersPage(p => p + 1)}
                            >
                              Next →
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-6">📖</div>
                      <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
                        {COPY.EMPTY_STATES.CHAPTERS_PUBLIC.TITLE}
                      </h2>
                      <p className="text-lg text-muted-foreground mb-8">
                        {COPY.EMPTY_STATES.CHAPTERS_PUBLIC.BODY}
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Link href="/auth/register">
                          <Button size="lg">{COPY.BUTTONS.START_YOUR_BOOK}</Button>
                        </Link>
                        <Link href="/auth/login">
                          <Button size="lg" variant="outline">Login</Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </TabTransition>
            )}

            {/* AUTH: Bookshelf Tab */}
            {isAuthenticated && activeTab === 'bookshelf' && (
              <TabTransition key="bookshelf">
                <div className="max-w-6xl mx-auto">
                  {bookshelfLoading ? (
                    <LoadingState message={COPY.LOADING.SHELF} />
                  ) : bookshelf && bookshelf.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {bookshelf.map((spine) => (
                        <Link
                          key={spine.id}
                          href={`/books/${spine.id}`}
                          className="group"
                        >
                          <div className="relative bg-card border-2 border-border rounded-lg p-4 h-48 flex flex-col justify-between hover:border-primary hover:shadow-md transition-all">
                            {spine.unread_count > 0 && (
                              <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                {spine.unread_count}
                              </div>
                            )}
                            
                            <div className="flex-1 flex items-center justify-center">
                              <h3 className="font-serif font-semibold text-foreground text-center group-hover:text-primary transition-colors">
                                {spine.username}
                              </h3>
                            </div>
                            
                            {spine.last_chapter_at && (
                              <p className="text-xs text-muted-foreground text-center">
                                {new Date(spine.last_chapter_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-6">📚</div>
                      <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
                        {COPY.EMPTY_STATES.SHELF.TITLE}
                      </h2>
                      <p className="text-lg text-muted-foreground whitespace-pre-line mb-8">
                        {COPY.EMPTY_STATES.SHELF.BODY}
                      </p>
                      <Button onClick={() => setActiveTab('books-spines')}>
                        {COPY.EMPTY_STATES.SHELF.CTA}
                      </Button>
                    </div>
                  )}
                </div>
              </TabTransition>
            )}

            {/* AUTH: New Chapters Tab */}
            {isAuthenticated && activeTab === 'new' && (
              <TabTransition key="new">
                <div className="max-w-7xl mx-auto">
                  {newChaptersLoading ? (
                    <LoadingState message={COPY.LOADING.CHAPTERS} />
                  ) : newChapters && newChapters.chapters.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {newChapters.chapters.map((chapter) => (
                          <Link
                            key={chapter.id}
                            href={`/chapters/${chapter.id}`}
                            className="block bg-card border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all group"
                          >
                            <div className="flex flex-col h-full">
                              <div className="flex items-start justify-between gap-2 mb-3">
                                <h3 className="text-lg font-serif font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
                                  {chapter.title}
                                </h3>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(chapter.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                by <span className="font-medium">{chapter.author_username}</span>
                              </p>
                              {chapter.mood && (
                                <p className="text-sm text-primary italic mt-auto">{chapter.mood}</p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>

                      {(newChaptersPage > 1 || newChapters.has_more) && (
                        <div className="flex items-center justify-center gap-4 mt-8">
                          {newChaptersPage > 1 && (
                            <Button
                              variant="outline"
                              onClick={() => setNewChaptersPage(p => p - 1)}
                            >
                              ← Previous
                            </Button>
                          )}
                          <span className="text-sm text-muted-foreground">
                            Page {newChaptersPage} of {newChapters.total_pages}
                          </span>
                          {newChapters.has_more && (
                            <Button
                              variant="outline"
                              onClick={() => setNewChaptersPage(p => p + 1)}
                            >
                              Next →
                            </Button>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-6">📖</div>
                      <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
                        {COPY.EMPTY_STATES.NEW_CHAPTERS.TITLE}
                      </h2>
                      <p className="text-lg text-muted-foreground whitespace-pre-line">
                        {COPY.EMPTY_STATES.NEW_CHAPTERS.BODY}
                      </p>
                    </div>
                  )}
                </div>
              </TabTransition>
            )}

            {/* AUTH: Quiet Picks Tab */}
            {isAuthenticated && activeTab === 'picks' && (
              <TabTransition key="picks">
                <div className="max-w-7xl mx-auto">
                  {quietPicksLoading ? (
                    <LoadingState message={COPY.LOADING.PICKS} />
                  ) : quietPicks && quietPicks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {quietPicks.map((chapter) => (
                        <Link
                          key={chapter.id}
                          href={`/chapters/${chapter.id}`}
                          className="block bg-card border-2 border-primary/30 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all group"
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <h3 className="text-lg font-serif font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1">
                                {chapter.title}
                              </h3>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(chapter.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              by <span className="font-medium">{chapter.author_username}</span>
                            </p>
                            {chapter.mood && (
                              <p className="text-sm text-primary italic mt-auto">{chapter.mood}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-6">🌙</div>
                      <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
                        {COPY.EMPTY_STATES.QUIET_PICKS.TITLE}
                      </h2>
                      <p className="text-lg text-muted-foreground whitespace-pre-line">
                        {COPY.EMPTY_STATES.QUIET_PICKS.BODY}
                      </p>
                    </div>
                  )}
                </div>
              </TabTransition>
            )}

            {/* SHARED: Books & Spines Tab */}
            {activeTab === 'books-spines' && (
              <TabTransition key="books-spines">
                <div className="max-w-6xl mx-auto">
                  {spinesLoading ? (
                    <LoadingState message={COPY.LOADING.BOOKS_SPINES} />
                  ) : filteredSpines && filteredSpines.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      {filteredSpines.map((spine: any) => (
                        <Link
                          key={spine.id}
                          href={`/books/${spine.book_id}`}
                          className="group"
                        >
                          <div className="bg-card border-2 border-border rounded-lg p-4 h-48 flex flex-col justify-between hover:border-primary hover:shadow-md transition-all">
                            <div className="flex-1 flex items-center justify-center">
                              <h3 className="font-serif font-semibold text-foreground text-center group-hover:text-primary transition-colors text-sm">
                                {spine.title}
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground text-center">
                              by {spine.author_username}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-6">📖</div>
                      <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
                        {COPY.EMPTY_STATES.BOOKS_SPINES.TITLE}
                      </h2>
                      <p className="text-lg text-muted-foreground mb-8">
                        {COPY.EMPTY_STATES.BOOKS_SPINES.BODY}
                      </p>
                      {!isAuthenticated && (
                        <div className="flex gap-4 justify-center">
                          <Link href="/auth/register">
                            <Button size="lg">{COPY.BUTTONS.START_YOUR_BOOK}</Button>
                          </Link>
                          <Link href="/auth/login">
                            <Button size="lg" variant="outline">Login</Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabTransition>
            )}

            {/* SHARED: Themes Tab */}
            {activeTab === 'themes' && (
              <TabTransition key="themes">
                <div className="max-w-6xl mx-auto">
                  {themesLoading ? (
                    <LoadingState message={COPY.LOADING.THEMES} />
                  ) : filteredThemes && filteredThemes.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredThemes.map((theme, index) => (
                        <motion.div
                          key={theme.id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.02, duration: 0.2 }}
                        >
                          <Link
                            href={`/themes/${theme.slug}`}
                            className="block bg-card border border-border rounded-lg p-6 hover:border-primary hover:shadow-md transition-all h-full"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              {theme.emoji && (
                                <span className="text-3xl">{theme.emoji}</span>
                              )}
                              <div className="flex-1">
                                <h3 className="text-lg font-serif font-semibold text-foreground mb-1">
                                  {theme.name}
                                </h3>
                                {theme.description && (
                                  <p className="text-sm text-muted-foreground leading-relaxed">
                                    {theme.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {theme.chapter_count} {theme.chapter_count === 1 ? 'chapter' : 'chapters'}
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="text-6xl mb-6">🏷️</div>
                      <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
                        {searchQuery ? `No themes found` : COPY.EMPTY_STATES.THEMES.TITLE}
                      </h2>
                      <p className="text-lg text-muted-foreground">
                        {searchQuery ? `Try a different search term` : COPY.EMPTY_STATES.THEMES.BODY}
                      </p>
                    </div>
                  )}
                </div>
              </TabTransition>
            )}
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </PageTransition>
  )
}
