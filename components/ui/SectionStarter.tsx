"use client";

import React, { useId } from "react";
import { motion } from "motion/react";

interface SectionStarterProps {
  title: string;
  className?: string;
}

export const SectionStarter: React.FC<SectionStarterProps> = ({
  title,
  className = "",
}) => {
  const rawId = useId();
  const gradientId = `starter-grad-${rawId.replace(/:/g, "")}`;

  // Dynamically calculate font size so any length word fits comfortably inside 1200px viewBox
  const len = title.length;
  const fontSize =
    len <= 5 ? 210 : len <= 8 ? 175 : len <= 12 ? 135 : len <= 17 ? 100 : 85;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden="true"
      className={`w-full overflow-hidden flex justify-center items-center select-none pointer-events-none mb-6 sm:mb-8 md:mb-12 ${className}`}
    >
      <svg
        viewBox="0 0 1200 200"
        className="w-full max-w-7xl lg:max-w-[1400px] h-auto max-h-[130px] sm:max-h-[180px] md:max-h-[220px] select-none pointer-events-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3F1345" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#551D5C" stopOpacity="0.8" />
            <stop offset="65%" stopColor="#7B3386" stopOpacity="0.32" />
            <stop offset="92%" stopColor="#F8F5FA" stopOpacity="0" />
          </linearGradient>
        </defs>
        <text
          x="50%"
          y="76%"
          textAnchor="middle"
          fill={`url(#${gradientId})`}
          fontSize={fontSize}
          fontWeight="900"
          letterSpacing="0.03em"
          style={{
            fontFamily:
              "var(--font-bricolage), 'Bricolage Grotesque', Anton, Impact, -apple-system, sans-serif",
          }}
        >
          {title.toUpperCase()}
        </text>
      </svg>
    </motion.div>
  );
};

