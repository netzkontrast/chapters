"use client"

import Image from "next/image"
import { motion } from "framer-motion"

interface LogoProps {
  size?: number
  animate?: boolean
  className?: string
}

export function Logo({ size = 48, animate = true, className = "" }: LogoProps) {
  const shakeVariants = {
    initial: { 
      scale: 0.8,
      opacity: 0,
      rotate: 0
    },
    animate: { 
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    },
    hover: {
      rotate: [0, -5, 5, -5, 5, 0],
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  }

  const glowVariants = {
    animate: {
      opacity: [0.3, 0.6, 0.3],
      scale: [1, 1.1, 1],
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
          src="/logo.png"
          alt="Chapters"
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
      variants={shakeVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-accent/20 to-primary/20 blur-xl"
        variants={glowVariants}
        animate="animate"
      />
      
      {/* Logo image */}
      <motion.div className="relative z-10">
        <Image
          src="/logo.png"
          alt="Chapters"
          width={size}
          height={size}
          className="object-contain drop-shadow-lg"
          priority
        />
      </motion.div>
    </motion.div>
  )
}
