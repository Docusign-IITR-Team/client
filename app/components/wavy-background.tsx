"use client"
import React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  offsetY = 0,
  animate = true,
}: {
  children?: React.ReactNode
  className?: string
  containerClassName?: string
  colors?: string[]
  waveWidth?: number
  backgroundFill?: string
  blur?: number
  speed?: "slow" | "fast"
  waveOpacity?: number
  offsetY?: number
  animate?: boolean
}) => {
  const defaultColors = ["#1e6cf8", "#4285f4", "#66a3ff"]
  const id = React.useId()

  return (
    <div className={cn("h-full w-full", containerClassName)}>
      <div className="absolute inset-0 z-0">
        <svg
          className={cn("w-full h-full", className)}
          viewBox="0 0 960 540"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id={`blur-${id}`} x="-100%" y="-100%" width="400%" height="400%">
              <feGaussianBlur stdDeviation={blur} />
            </filter>
          </defs>
          <rect width="960" height="540" fill={backgroundFill || colors?.[0] || defaultColors[0]} />
          {(colors ?? defaultColors).map((color, index) => (
            <motion.path
              key={index}
              d="M1920 0V540H0V0C0 0 211 12 418.5 72C626 132 747 282 931 342C1115 402 1920 0 1920 0Z"
              fill={color}
              animate={{
                d: [
                  "M1920 0V540H0V0C0 0 211 12 418.5 72C626 132 747 282 931 342C1115 402 1920 0 1920 0Z",
                  "M1920 0V540H0V0C0 0 0 12 207.5 72C415 132 747 282 931 342C1115 402 1920 0 1920 0Z",
                ],
              }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "mirror",
                duration: speed === "slow" ? 10 : 5,
                ease: "easeInOut",
              }}
            />
          ))}
        </svg>
      </div>
      {children}
    </div>
  )
}

