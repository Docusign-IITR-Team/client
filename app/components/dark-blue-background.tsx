"use client"

import type React from "react"
import { motion } from "framer-motion"

const NoiseTexture = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" opacity="0.05" />
    </svg>
  )
  
  
const FloatingShape = ({ className }: { className?: string }) => (
  <motion.div
    className={`absolute rounded-full mix-blend-screen filter blur-xl opacity-70 ${className}`}
    animate={{
      scale: [1, 1.2, 1],
      x: [0, 10, -10, 0],
      y: [0, -10, 10, 0],
    }}
    transition={{
      duration: 10,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
    }}
  />
)

export const DarkBlueBackground = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-indigo-900/50 via-purple-900/50 to-blue-900/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5 }}
      />
      <FloatingShape className="w-96 h-96 bg-blue-500/30 left-[-10%] top-[-10%]" />
      <FloatingShape className="w-96 h-96 bg-indigo-500/30 right-[-5%] top-[20%]" />
      <FloatingShape className="w-96 h-96 bg-purple-500/30 left-[10%] bottom-[-10%]" />
      <div className="absolute inset-0 opacity-50">
        <NoiseTexture />
      </div>
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/10 to-blue-900/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

