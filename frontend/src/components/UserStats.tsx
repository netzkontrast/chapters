"use client"

import { useQuery } from "@tanstack/react-query"
import { apiClient } from "@/lib/api-client"
import { useMuseLevel } from "@/hooks/useMuse"

interface UserData {
  id: number
  email: string
  username: string
  open_pages: number
  muse_level: string
  muse_xp: number
  created_at: string
}

const MUSE_LEVEL_ICONS = {
  spark: "✨",
  shaper: "🔨",
  echo: "🔮",
  resonance: "🌟",
}

const MUSE_LEVEL_NAMES = {
  spark: "Spark",
  shaper: "Shaper",
  echo: "Echo",
  resonance: "Resonance",
}

export function UserStats() {
  const { data: user, isLoading: userLoading } = useQuery<UserData>({
    queryKey: ['current-user'],
    queryFn: () => apiClient.get('/auth/me'),
  })

  const { data: museLevel, isLoading: museLevelLoading } = useMuseLevel()

  if (userLoading || !user) return null

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      {/* Open Pages Counter */}
      <div 
        className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-primary/10 border border-primary/30 rounded-lg transition-all hover:bg-primary/20"
        title="Open Pages available for publishing"
      >
        <span className="text-base sm:text-lg">📖</span>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground leading-none hidden sm:block">Open Pages</span>
          <span className="text-sm font-semibold text-foreground leading-none mt-0.5">
            {user.open_pages}
          </span>
        </div>
      </div>

      {/* Muse Level */}
      <div 
        className="flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-accent/10 border border-accent/30 rounded-lg transition-all hover:bg-accent/20"
        title={
          museLevel && museLevel.next_level 
            ? `${museLevel.xp} XP • ${museLevel.xp_to_next} XP to ${museLevel.next_level_name}`
            : `${user.muse_xp} XP • Max level reached`
        }
      >
        <span className="text-base sm:text-lg">
          {MUSE_LEVEL_ICONS[user.muse_level as keyof typeof MUSE_LEVEL_ICONS] || "✨"}
        </span>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground leading-none hidden sm:block">Muse</span>
          <span className="text-sm font-semibold text-foreground leading-none mt-0.5">
            {MUSE_LEVEL_NAMES[user.muse_level as keyof typeof MUSE_LEVEL_NAMES] || "Spark"}
          </span>
        </div>
      </div>
    </div>
  )
}
