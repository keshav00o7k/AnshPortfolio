"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";

interface ToolItem {
  id: string;
  name: string;
  src: string;
  pos: string;
  floatY: number[];
  floatRotate: number[];
  duration: number;
  delay: number;
  size: string;
}

const toolLogos: ToolItem[] = [
  // 1. Top Center: DaVinci Resolve
  {
    id: "davinci",
    name: "DaVinci Resolve",
    src: "/tools/tool-01.svg",
    pos: "top-[6%] left-1/2 -translate-x-1/2",
    floatY: [-10, 8, -10],
    floatRotate: [-2, 2, -2],
    duration: 5.2,
    delay: 0,
    size: "w-11 h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16",
  },
  // 2. Top Left: Premiere Pro "Pr"
  {
    id: "premiere",
    name: "Adobe Premiere Pro",
    src: "/tools/tool-02.svg",
    pos: "top-[10%] left-[8%] sm:left-[20%] md:left-[26%]",
    floatY: [-8, 10, -8],
    floatRotate: [1, -2, 1],
    duration: 4.8,
    delay: 0.6,
    size: "w-11 h-11 sm:w-14 sm:h-14 lg:w-15 lg:h-15",
  },
  // 3. Top Right: After Effects "Ae"
  {
    id: "aftereffects",
    name: "Adobe After Effects",
    src: "/tools/tool-09.svg",
    pos: "top-[10%] right-[8%] sm:right-[18%] md:right-[22%]",
    floatY: [-11, 7, -11],
    floatRotate: [-1, 2, -1],
    duration: 5.5,
    delay: 1.2,
    size: "w-11 h-11 sm:w-14 sm:h-14 lg:w-15 lg:h-15",
  },
  // 4. Mid Left Top: Clipchamp / Waveform
  {
    id: "waveform",
    name: "Video Editing",
    src: "/tools/tool-08.svg",
    pos: "top-[32%] left-[4%] sm:left-[8%] md:left-[12%]",
    floatY: [-6, 10, -6],
    floatRotate: [2, -1, 2],
    duration: 4.5,
    delay: 0.3,
    size: "w-10 h-10 sm:w-13 sm:h-13 lg:w-14 lg:h-14",
  },
  // 5. Mid Left Bottom: Final Cut Pro
  {
    id: "finalcut",
    name: "Final Cut Pro",
    src: "/tools/tool-07.svg",
    pos: "top-[54%] left-[4%] sm:left-[8%] md:left-[12%]",
    floatY: [-10, 8, -10],
    floatRotate: [-2, 1, -2],
    duration: 5.7,
    delay: 1.5,
    size: "w-10 h-10 sm:w-13 sm:h-13 lg:w-14 lg:h-14",
  },
  // 6. Mid Right: CapCut
  {
    id: "capcut",
    name: "CapCut",
    src: "/tools/tool-03.svg",
    pos: "top-[40%] right-[4%] sm:right-[8%] md:right-[12%]",
    floatY: [-9, 9, -9],
    floatRotate: [2, -2, 2],
    duration: 5.0,
    delay: 0.9,
    size: "w-11 h-11 sm:w-14 sm:h-14 lg:w-15 lg:h-15",
  },
  // 7. Bottom Left: Blender
  {
    id: "blender",
    name: "Blender",
    src: "/tools/tool-06.svg",
    pos: "bottom-[10%] left-[8%] sm:left-[20%] md:left-[24%]",
    floatY: [-10, 6, -10],
    floatRotate: [1, -2, 1],
    duration: 5.3,
    delay: 0.5,
    size: "w-11 h-11 sm:w-14 sm:h-14 lg:w-15 lg:h-15",
  },
  // 8. Bottom Center: Canva
  {
    id: "canva",
    name: "Canva",
    src: "/tools/tool-05.svg",
    pos: "bottom-[6%] left-1/2 -translate-x-1/2",
    floatY: [-7, 11, -7],
    floatRotate: [-2, 2, -2],
    duration: 4.7,
    delay: 1.8,
    size: "w-11 h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16",
  },
  // 9. Bottom Right: Foundry / Nuke
  {
    id: "foundry",
    name: "Motion Graphics",
    src: "/tools/tool-04.svg",
    pos: "bottom-[10%] right-[8%] sm:right-[18%] md:right-[22%]",
    floatY: [-9, 9, -9],
    floatRotate: [2, -1, 2],
    duration: 5.1,
    delay: 1.1,
    size: "w-11 h-11 sm:w-14 sm:h-14 lg:w-15 lg:h-15",
  },
];

export const FootageCtaSection: React.FC = () => {
  return (
    <section
      aria-label="Start a project call to action"
      className="relative w-full min-h-[480px] sm:min-h-[560px] lg:min-h-[640px] flex items-center justify-center overflow-hidden py-16 sm:py-24 px-2 sm:px-4 border-t border-line/60 bg-bg"
    >
      {/* Subtle radial glow in background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(123, 51, 134, 0.08) 0%, transparent 80%)",
        }}
      />

      {/* Floating Tool Logos spanning 100% screen */}
      <div className="absolute inset-0 w-full pointer-events-none">
        {toolLogos.map((tool) => (
          <motion.div
            key={tool.id}
            animate={{
              y: tool.floatY,
              rotate: tool.floatRotate,
            }}
            transition={{
              duration: tool.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
              delay: tool.delay,
            }}
            className={`absolute ${tool.pos} select-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.08)]`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={tool.src}
              alt={tool.name}
              className={`${tool.size} object-contain pointer-events-auto transition-transform duration-300 hover:scale-115 cursor-pointer`}
              loading="lazy"
            />
          </motion.div>
        ))}
      </div>

      {/* Center Content */}
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center text-center px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-ink font-[family-name:var(--font-bricolage)] leading-[1.12]"
        >
          Your Footage Deserves{" "}
          <span className="block mt-1 sm:mt-2">
            a{" "}
            <span className="font-[family-name:var(--font-playfair)] italic font-normal text-violet">
              Great Edit.
            </span>
          </span>
        </motion.h2>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="mt-8 sm:mt-10"
        >
          <Link
            href="/contact"
            style={{ borderRadius: "6px 30px 6px 30px" }}
            className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-violet bg-white text-violet font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_0px_#3F1345] hover:bg-violet hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac"
          >
            START A PROJECT
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

