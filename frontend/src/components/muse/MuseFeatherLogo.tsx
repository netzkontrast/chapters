"use client"

import { motion } from "framer-motion"

interface MuseFeatherLogoProps {
  size?: number
  animate?: boolean
  className?: string
}

export function MuseFeatherLogo({ size = 64, animate = true, className = "" }: MuseFeatherLogoProps) {
  const featherVariants = {
    initial: { 
      rotate: -10,
      y: 0,
      opacity: 0
    },
    animate: { 
      rotate: [- 10, 5, -10],
      y: [0, -8, 0],
      opacity: 1,
      transition: {
        rotate: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        },
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        },
        opacity: {
          duration: 0.6,
          ease: "easeOut"
        }
      }
    },
    hover: {
      rotate: 0,
      y: -12,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  }

  const glowVariants = {
    initial: { opacity: 0 },
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

  return (
    <motion.div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      initial="initial"
      animate={animate ? "animate" : "initial"}
      whileHover={animate ? "hover" : undefined}
    >
      {/* Glow effect */}
      {animate && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-400/30 via-pink-400/30 to-blue-400/30 blur-xl"
          variants={glowVariants}
        />
      )}
      
      {/* Feather SVG */}
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
        variants={featherVariants}
      >
        {/* Main feather shaft */}
        <motion.path
          d="M12 2 L12 22"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="text-foreground"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
        
        {/* Left barbs */}
        <motion.path
          d="M12 4 Q8 6 6 8 M12 7 Q9 8.5 7.5 10 M12 10 Q9.5 11 8 12.5 M12 13 Q10 14 9 15.5 M12 16 Q10.5 17 10 18"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          className="text-primary"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3, ease: "easeInOut" }}
        />
        
        {/* Right barbs */}
        <motion.path
          d="M12 4 Q16 6 18 8 M12 7 Q15 8.5 16.5 10 M12 10 Q14.5 11 16 12.5 M12 13 Q14 14 15 15.5 M12 16 Q13.5 17 14 18"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          className="text-accent"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5, ease: "easeInOut" }}
        />
        
        {/* Decorative tip */}
        <motion.circle
          cx="12"
          cy="2"
          r="1.5"
          fill="currentColor"
          className="text-primary"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.5, ease: "backOut" }}
        />
      </motion.svg>
    </motion.div>
  )
}

/**
 * Simplified static version for small sizes
 */
export function MuseFeatherIcon({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      className={className}
    >
      <path
        d="M12 2 L12 22"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 4 Q8 6 6 8 M12 7 Q9 8.5 7.5 10 M12 10 Q9.5 11 8 12.5 M12 13 Q10 14 9 15.5 M12 16 Q10.5 17 10 18"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M12 4 Q16 6 18 8 M12 7 Q15 8.5 16.5 10 M12 10 Q14.5 11 16 12.5 M12 13 Q14 14 15 15.5 M12 16 Q13.5 17 14 18"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.7"
      />
      <circle cx="12" cy="2" r="1.5" fill="currentColor" />
    </svg>
  )
}
