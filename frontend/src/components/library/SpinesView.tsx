"use client"

import Link from "next/link"
import { LoadingState } from "@/components/LoadingState"
import { useSpines } from "@/hooks/useSpines"
import { motion } from "framer-motion"

export function SpinesView() {
  const { data: spines, isLoading } = useSpines()

  if (isLoading) {
    return <LoadingState message="Loading Spines..." />
  }

  if (!spines || spines.length === 0) {
    return (
      <div className="text-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="text-6xl mb-6">📚</div>
          <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
            No Spines Yet
          </h2>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Read a few chapters. Books will appear here as you explore.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {spines.map((spine) => (
        <Link
          key={spine.book_id}
          href={`/books/${spine.user_id}`}
          className="group"
        >
          <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all hover:border-primary/50">
            {/* Cover or placeholder */}
            {spine.cover_image_url ? (
              <div className="w-full h-48 mb-4 rounded-lg overflow-hidden bg-muted">
                <img
                  src={spine.cover_image_url}
                  alt={spine.display_name || spine.username}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-48 mb-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <span className="text-6xl">📖</span>
              </div>
            )}

            {/* Book info */}
            <h3 className="text-xl font-serif font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
              {spine.display_name || spine.username}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-3">
              by {spine.username}
            </p>

            {spine.bio && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {spine.bio}
              </p>
            )}

            {spine.last_chapter_at && (
              <p className="text-xs text-muted-foreground">
                Last chapter: {new Date(spine.last_chapter_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
