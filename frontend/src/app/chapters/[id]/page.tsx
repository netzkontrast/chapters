"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LoadingState } from "@/components/LoadingState"
import { MarginsDrawer } from "@/components/margins/MarginsDrawer"
import { ReadingProgress } from "@/components/ReadingProgress"
import { useChapter, useMargins, useHeartChapter, useBookmarkChapter } from "@/hooks/useLibrary"
import { apiClient } from "@/lib/api-client"
import { motion } from "framer-motion"
import type { ChapterBlock } from "@/services/library"

function ChapterBlockComponent({ block }: { block: ChapterBlock }) {
  switch (block.block_type) {
    case 'text':
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="prose prose-lg max-w-none"
        >
          <p className="text-foreground leading-[1.8] text-lg font-serif whitespace-pre-wrap tracking-wide">
            {block.content.text}
          </p>
        </motion.div>
      )

    case 'quote':
      return (
        <motion.blockquote
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="border-l-4 border-primary/50 pl-8 py-6 my-8 bg-primary/5 rounded-r-lg"
        >
          <p className="text-xl italic text-foreground leading-[1.8] font-serif">
            "{block.content.text}"
          </p>
          {block.content.attribution && (
            <footer className="text-sm text-muted-foreground mt-4 font-sans">
              — {block.content.attribution}
            </footer>
          )}
        </motion.blockquote>
      )

    case 'image':
      return (
        <motion.figure
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="my-10"
        >
          <img
            src={block.content.url}
            alt={block.content.caption || ''}
            className="w-full rounded-xl shadow-lg border border-border"
          />
          {block.content.caption && (
            <figcaption className="text-sm text-muted-foreground text-center mt-4 italic">
              {block.content.caption}
            </figcaption>
          )}
        </motion.figure>
      )

    case 'audio':
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="my-10 bg-card border border-border rounded-xl p-6 shadow-sm"
        >
          <audio controls className="w-full">
            <source src={block.content.url} />
            Your browser does not support audio playback.
          </audio>
          {block.content.caption && (
            <p className="text-sm text-muted-foreground mt-4">{block.content.caption}</p>
          )}
        </motion.div>
      )

    case 'video':
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="my-10"
        >
          <video controls className="w-full rounded-xl border border-border shadow-lg">
            <source src={block.content.url} />
            Your browser does not support video playback.
          </video>
          {block.content.caption && (
            <p className="text-sm text-muted-foreground text-center mt-4 italic">
              {block.content.caption}
            </p>
          )}
        </motion.div>
      )

    default:
      return null
  }
}

export default function ChapterPage() {
  const params = useParams()
  const router = useRouter()
  const chapterId = params.id as string
  const [showMargins, setShowMargins] = useState(false)

  const { data: chapter, isLoading: chapterLoading } = useChapter(chapterId)
  const { data: margins, isLoading: marginsLoading } = useMargins(chapterId)
  const heartMutation = useHeartChapter()
  const bookmarkMutation = useBookmarkChapter()

  const handleHeart = () => {
    if (!chapter) return
    heartMutation.mutate({ chapterId: chapter.id, isHearted: chapter.is_hearted })
  }

  const handleBookmark = () => {
    if (!chapter) return
    bookmarkMutation.mutate({ chapterId: chapter.id, isBookmarked: chapter.is_bookmarked })
  }

  const handleAddMargin = async (text: string) => {
    await apiClient.post(`/margins/chapters/${chapterId}`, { text })
    // Refetch margins after adding
    window.location.reload() // Simple refresh for now
  }

  if (chapterLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingState message="Loading chapter..." />
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-semibold text-foreground mb-4">Chapter not found</h1>
          <Button onClick={() => router.push('/library')}>Back to Library</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <ReadingProgress />
      
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/library')}>
            ← Back
          </Button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant={chapter.is_hearted ? "secondary" : "ghost"}
              size="sm"
              onClick={handleHeart}
              disabled={heartMutation.isPending}
              className={`${chapter.is_hearted ? "bg-primary/10 text-foreground" : "text-foreground"}`}
            >
              💖 {chapter.is_hearted ? "Hearted" : "Heart"}
            </Button>
            <Button
              variant={chapter.is_bookmarked ? "secondary" : "ghost"}
              size="sm"
              onClick={handleBookmark}
              disabled={bookmarkMutation.isPending}
              className={`${chapter.is_bookmarked ? "bg-primary/10 text-foreground" : "text-foreground"}`}
            >
              🔖 {chapter.is_bookmarked ? "Saved" : "Save"}
            </Button>
            <Button
              variant={showMargins ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setShowMargins(!showMargins)}
              className={`${showMargins ? "bg-primary/10 text-foreground" : "text-foreground"}`}
            >
              💬 Margins
            </Button>
          </div>
        </div>
      </header>

      {/* Chapter Content */}
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Chapter Header */}
          <motion.header
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <h1 className="text-5xl font-serif font-bold text-foreground mb-6 leading-tight">
              {chapter.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              {chapter.author?.book_id ? (
                <Link
                  href={`/books/${chapter.author.book_id}`}
                  className="hover:text-primary transition-colors font-medium"
                >
                  by {chapter.author.username}
                </Link>
              ) : (
                <span>
                  by <span className="font-medium">{chapter.author?.username || 'Unknown'}</span>
                </span>
              )}
              <span>•</span>
              <span>{new Date(chapter.published_at).toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
            {chapter.mood && (
              <p className="text-muted-foreground italic text-lg mb-4">{chapter.mood}</p>
            )}
            
            {/* Themes */}
            {chapter.themes && chapter.themes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {chapter.themes.map((theme: any) => (
                  <Link
                    key={theme.id}
                    href={`/themes/${theme.slug}`}
                    className="text-sm px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-all hover:scale-105"
                  >
                    {theme.emoji} {theme.name}
                  </Link>
                ))}
              </div>
            )}
          </motion.header>

          {/* Chapter Blocks */}
          <div className="space-y-8 font-serif text-lg leading-relaxed">
            {chapter.blocks.map((block) => (
              <ChapterBlockComponent key={block.id} block={block} />
            ))}
          </div>

          {/* End Spacer */}
          <div className="h-24" />
        </div>
      </article>

      {/* Margins Section */}
      {showMargins && (
        <aside className="fixed right-0 top-0 bottom-0 w-96 bg-card border-l border-border shadow-lg z-20 overflow-hidden">
          <MarginsDrawer
            chapterId={chapterId}
            margins={margins || []}
            isLoading={marginsLoading}
            onAddMargin={handleAddMargin}
          />
        </aside>
      )}
    </div>
  )
}
