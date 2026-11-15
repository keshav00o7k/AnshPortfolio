"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { VideoModal } from "@/components/work/VideoModal";
import { ModalVideoItem, Project } from "@/types";

interface ReelItem {
  id: string;
  videoUrl: string;
  title: string;
  fullVideoUrl?: string;
  posterUrl?: string;
}

const reels: ReelItem[] = [
  { id: "reel-01", videoUrl: "/videos/reel-01.mp4", title: "Visual Story 01" },
  { id: "reel-02", videoUrl: "/videos/reel-02.mp4", title: "Visual Story 02" },
  { id: "reel-03", videoUrl: "/videos/reel-03.mp4", title: "Visual Story 03" },
  { id: "reel-04", videoUrl: "/videos/reel-04.mp4", title: "Visual Story 04" },
  { id: "reel-05", videoUrl: "/videos/reel-05.mp4", title: "Visual Story 05" },
  { id: "reel-06", videoUrl: "/videos/reel-06.mp4", title: "Visual Story 06" },
  { id: "reel-07", videoUrl: "/videos/reel-07.mp4", title: "Visual Story 07" },
  { id: "reel-08", videoUrl: "/videos/reel-08.mp4", title: "Visual Story 08" },
  { id: "reel-09", videoUrl: "/videos/reel-09.mp4", title: "Visual Story 09" },
];

interface ReelCoverflowSectionProps {
  projects?: Project[];
}

export const ReelCoverflowSection: React.FC<ReelCoverflowSectionProps> = ({ projects }) => {
  const reelList: ReelItem[] =
    projects && projects.length > 0
      ? projects.map((p) => ({
          id: p.id,
          videoUrl: p.videoUrl,
          title: p.title,
          fullVideoUrl: p.fullVideoUrl,
          posterUrl: p.posterUrl,
        }))
      : reels;

  const total = reelList.length;
  const [activeIndex, setActiveIndex] = useState(() => Math.min(3, Math.max(0, Math.floor(total / 2))));
  const [activeModalItem, setActiveModalItem] = useState<ModalVideoItem | null>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(null);

  // Responsive screen width state
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Smooth drag tracking
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const currentDragDelta = useRef(0);
  const isDragAction = useRef(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const lastWheelTime = useRef(0);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    currentDragDelta.current = 0;
    isDragAction.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX.current;
    currentDragDelta.current = delta;
    if (Math.abs(delta) > 6) {
      isDragAction.current = true;
    }
    // Damped drag offset for buttery feedback
    setDragOffset(delta * 0.4);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    const delta = currentDragDelta.current;
    if (Math.abs(delta) > 35) {
      if (delta < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setIsDragging(false);
    setDragOffset(0);
  };

  // Touch Drag Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    dragStartX.current = e.touches[0].clientX;
    currentDragDelta.current = 0;
    isDragAction.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientX - dragStartX.current;
    currentDragDelta.current = delta;
    if (Math.abs(delta) > 6) {
      isDragAction.current = true;
    }
    setDragOffset(delta * 0.4);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    const delta = currentDragDelta.current;
    if (Math.abs(delta) > 30) {
      if (delta < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setIsDragging(false);
    setDragOffset(0);
  };

  // Throttled Wheel Navigation for Trackpads and Mouse Wheels
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 260) return;

    if (Math.abs(e.deltaX) > 20 || (e.shiftKey && Math.abs(e.deltaY) > 20)) {
      lastWheelTime.current = now;
      if (e.deltaX > 0 || (e.shiftKey && e.deltaY > 0)) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // Card click: center if side card, or open with sound if active
  const handleCardClick = (
    item: ReelItem,
    index: number,
    el: HTMLElement | null
  ) => {
    if (isDragAction.current) return;

    if (index !== activeIndex) {
      setActiveIndex(index);
    } else {
      setTriggerElement(el);
      setActiveModalItem({
        id: item.id,
        title: item.title,
        format: "9:16",
        videoUrl: item.videoUrl,
        fullVideoUrl: item.fullVideoUrl,
      });
    }
  };

  // Autoplay all background videos silently
  useEffect(() => {
    videoRefs.current.forEach((vid) => {
      if (vid) {
        vid.muted = true;
        vid.play().catch(() => {});
      }
    });
  }, []);

  // If an empty project array is explicitly passed (e.g. 0 published in production), hide cleanly
  if (projects && projects.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Visual Stories Reels Showcase"
      className="relative w-full pt-0 sm:pt-2 pb-16 sm:pb-24 overflow-hidden select-none px-0"
    >
      {/* Background ambient radial glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[550px] bg-violet/5 blur-[140px] rounded-full pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* Header Container with dedicated isolation from the carousel */}
      <div className="relative max-w-5xl mx-auto px-6 text-center mb-4 sm:mb-6">
        {/* Top category badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet/25 bg-surface/80 text-[10.5px] sm:text-xs font-semibold tracking-[0.22em] uppercase text-violet shadow-sm mb-4"
        >
          <span>VIDEO EDITING</span>
          <span className="w-1 h-1 rounded-full bg-violet/40" />
          <span>MOTION</span>
          <span className="w-1 h-1 rounded-full bg-violet/40" />
          <span>POST PRODUCTION</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink leading-[1.18]"
        >
          We Turn Raw Footage Into{" "}
          <span className="block sm:inline font-[family-name:var(--font-playfair)] italic font-normal text-violet">
            Visual Stories.
          </span>
        </motion.h2>

        {/* Asymmetric CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 flex justify-center"
        >
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-7 py-3 text-xs uppercase font-bold tracking-widest text-ink hover:text-white bg-surface border-2 border-violet/35 hover:bg-violet hover:border-violet transition-all duration-300 shadow-sm hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ borderRadius: "6px 24px 6px 24px" }}
          >
            START A PROJECT
          </Link>
        </motion.div>
      </div>

      {/* 3D Coverflow Viewport */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className="relative w-full px-0 h-[510px] sm:h-[570px] md:h-[630px] lg:h-[670px] flex items-center justify-center cursor-grab active:cursor-grabbing overflow-visible"
        style={{ perspective: "1450px" }}
      >
        {/* Navigation Arrow Left */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevSlide();
          }}
          aria-label="Previous reel"
          className="absolute left-2 sm:left-6 lg:left-10 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-surface/95 border border-line shadow-xl backdrop-blur-md flex items-center justify-center text-ink hover:text-violet hover:border-violet/40 hover:scale-110 active:scale-95 transition-all"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Navigation Arrow Right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextSlide();
          }}
          aria-label="Next reel"
          className="absolute right-2 sm:right-6 lg:right-10 top-1/2 -translate-y-1/2 z-50 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-surface/95 border border-line shadow-xl backdrop-blur-md flex items-center justify-center text-ink hover:text-violet hover:border-violet/40 hover:scale-110 active:scale-95 transition-all"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* 3D Arc Container */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {reelList.map((reel, index) => {
            // Shortest wrapped circular offset
            let offset = index - activeIndex;
            while (offset > total / 2) offset -= total;
            while (offset < -total / 2) offset += total;

            const isCenter = offset === 0;
            const absOffset = Math.abs(offset);
            const isVisible = absOffset <= 3; // Render center + 3 left + 3 right

            if (!isVisible) return null;

            // Pure Cylindrical 3D Math scaled ~110%
            const R =
              windowWidth < 640
                ? 450
                : windowWidth < 1024
                ? 600
                : windowWidth < 1440
                ? 780
                : 860;
            const angleStep =
              windowWidth < 640 ? 25 : windowWidth < 1024 ? 23 : 21;

            const angleDeg = offset * angleStep;
            const angleRad = (angleDeg * Math.PI) / 180;

            // Non-linear projection onto cylinder arc
            const calculatedX = R * Math.sin(angleRad);
            const calculatedZ = R * (Math.cos(angleRad) - 1);
            const rotateY = -angleDeg;

            // Apply drag offset smoothly
            const finalX = calculatedX + dragOffset;
            const scale = isCenter ? 1.07 : Math.max(0.7, 0.93 - (absOffset - 1) * 0.12);
            const opacity = isCenter ? 1 : Math.max(0.48, 0.9 - (absOffset - 1) * 0.18);
            const zIndex = 40 - absOffset * 8;

            return (
              <motion.div
                key={reel.id}
                data-reel-id={reel.id}
                role="button"
                tabIndex={0}
                aria-label={`View ${reel.title}`}
                onClick={(e) => handleCardClick(reel, index, e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleCardClick(reel, index, e.currentTarget);
                  }
                }}
                animate={{
                  x: finalX,
                  y: 0,
                  z: calculatedZ,
                  rotateY,
                  scale,
                  opacity,
                }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 28,
                  mass: 0.8,
                }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  translateX: "-50%",
                  translateY: "-50%",
                  transformStyle: "preserve-3d",
                  zIndex,
                }}
                className={`group w-[185px] sm:w-[220px] md:w-[255px] lg:w-[275px] xl:w-[290px] aspect-[9/16] rounded-[22px] sm:rounded-[26px] overflow-hidden bg-surface border shadow-2xl cursor-pointer ${
                  isCenter
                    ? "border-violet/70 shadow-[0_25px_60px_rgba(63,19,69,0.36)] ring-2 ring-violet/30"
                    : "border-line/70 hover:border-violet/40 hover:opacity-100"
                }`}
              >
                {/* Background Video (Silent AutoPlay) */}
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={`${reel.videoUrl}#t=0.1`}
                  poster={reel.posterUrl}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  className="w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-105"
                  aria-hidden="true"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none opacity-60 group-hover:opacity-0 transition-opacity duration-300" />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 mt-10 sm:mt-14">
        {reelList.map((reel, idx) => (
          <button
            key={reel.id}
            onClick={() => setActiveIndex(idx)}
            aria-label={`Go to reel ${idx + 1}`}
            className={`transition-all duration-300 rounded-full ${
              idx === activeIndex
                ? "w-8 h-2.5 bg-violet"
                : "w-2.5 h-2.5 bg-line hover:bg-violet/50"
            }`}
          />
        ))}
      </div>

      {/* Modal for playing reel with full audio and controls */}
      <AnimatePresence>
        {activeModalItem && (
          <VideoModal
            item={activeModalItem}
            onClose={() => setActiveModalItem(null)}
            triggerElement={triggerElement}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
