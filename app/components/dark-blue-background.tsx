"use client";

import type React from "react";
import { motion } from "framer-motion";

const NoiseTexture = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <filter id="noise">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.65"
        numOctaves="3"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#noise)" opacity="0.05" />
  </svg>
);

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
);

export const DarkBlueBackground = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Main background gradient with darker tones */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[#0b0f1a] via-[#121d3b] to-[#0c1228]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      {/* Secondary gradient with subtle overlays */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-[#0c1228]/50 via-[#1a2547]/40 to-[#121b35]/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 1.5 }}
      />

      {/* Floating shapes with enhanced dark bluish tones */}
      <FloatingShape className="w-96 h-96 bg-[#20355a]/30 left-[-10%] top-[-10%]" />
      <FloatingShape className="w-96 h-96 bg-[#2a4d7e]/30 right-[-5%] top-[20%]" />
      <FloatingShape className="w-96 h-96 bg-[#324768]/30 left-[10%] bottom-[-10%]" />

      {/* Noise overlay for texture */}
      <div className="absolute inset-0 opacity-30">
        <NoiseTexture />
      </div>

      {/* Faded overlay for added depth */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-[#12182e]/40 to-[#0b0f1a]/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Content wrapper */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
