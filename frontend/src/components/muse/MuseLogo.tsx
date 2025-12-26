"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface MuseLogoProps {
  size?: number
  animate?: boolean
  className?: string
}

export function MuseLogo({ size = 64, animate = true, className = "" }: MuseLogoProps) {
  const containerVariants = {
    initial: { 
      scale: 0.8,
      opacity: 0
    },
    animate: { 
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  const floatVariants = {
    animate: {
      y: [0, -8, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const glowVariants = {
    animate: {
      opacity: [0.4, 0.7, 0.4],
      scale: [1, 1.05, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  if (!animate) {
    return (
      <div className={`relative ${className}`} style={{ width: size, height: size }}>
        <Image
          src="/muse.png"
          alt="Muse"
          width={size}
          height={size}
          className="object-contain"
          priority
        />
      </div>
    )
  }

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-blue-400/20 blur-2xl"
        variants={glowVariants}
        animate="animate"
      />
      
      {/* Floating image */}
      <motion.div
        variants={floatVariants}
        animate="animate"
        className="relative z-10"
      >
        <Image
          src="/muse.png"
          alt="Muse"
          width={size}
          height={size}
          className="object-contain drop-shadow-lg"
          priority
        />
      </motion.div>
    </motion.div>
  )
}
