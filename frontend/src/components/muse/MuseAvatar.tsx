"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface MuseAvatarProps {
  size?: "sm" | "md" | "lg" | "xl"
  animate?: boolean
  className?: string
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
}

export function MuseAvatar({ size = "md", animate = true, className = "" }: MuseAvatarProps) {
  const pixelSize = sizeMap[size]

  const avatarContent = (
    <div className={`relative ${className}`} style={{ width: pixelSize, height: pixelSize }}>
      <Image
        src="/muse.png"
        alt="Muse AI"
        width={pixelSize}
        height={pixelSize}
        className="rounded-full"
        priority
      />
    </div>
  )

  if (!animate) {
    return avatarContent
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      {avatarContent}
    </motion.div>
  )
}

/**
 * Muse Avatar with breathing animation (for thinking/loading states)
 */
export function MuseAvatarThinking({ size = "md", className = "" }: Omit<MuseAvatarProps, "animate">) {
  const pixelSize = sizeMap[size]

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      animate={{
        scale: [1, 1.05, 1],
        opacity: [1, 0.8, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <Image
        src="/muse.png"
        alt="Muse AI thinking"
        width={pixelSize}
        height={pixelSize}
        className="rounded-full"
        priority
      />
      {/* Subtle glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20 blur-md"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  )
}

/**
 * Muse Avatar with pulse animation (for notifications/new suggestions)
 */
export function MuseAvatarPulse({ size = "md", className = "" }: Omit<MuseAvatarProps, "animate">) {
  const pixelSize = sizeMap[size]

  return (
    <div className={`relative ${className}`} style={{ width: pixelSize, height: pixelSize }}>
      <Image
        src="/muse.png"
        alt="Muse AI"
        width={pixelSize}
        height={pixelSize}
        className="rounded-full relative z-10"
        priority
      />
      {/* Pulse rings */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary"
        animate={{
          scale: [1, 1.5, 1.5],
          opacity: [0.6, 0, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
        }}
      />
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-primary"
        animate={{
          scale: [1, 1.5, 1.5],
          opacity: [0.6, 0, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeOut",
          delay: 1,
        }}
      />
    </div>
  )
}
