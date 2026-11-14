"use client";

import React, { useEffect, useRef } from "react";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";

interface ShowreelPlayerProps {
  videoUrl: string;
  isPlaceholder?: boolean;
}

export const ShowreelPlayer: React.FC<ShowreelPlayerProps> = ({
  videoUrl,
  isPlaceholder = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container) return;

    // Respect prefers-reduced-motion: show paused first frame, no autoplay
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      video.pause();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
              playPromise.catch(() => {
                // Autoplay was prevented or video interrupted; safely swallow
              });
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center"
    >
      {/* Phone Mockup Frame */}
      <div className="relative w-[230px] sm:w-[270px] md:w-[310px] lg:w-[350px] xl:w-[390px] aspect-[9/16] rounded-[36px] p-2.5 bg-surface border border-line shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        {/* Subtle camera / speaker notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-3.5 bg-bg rounded-full z-20 flex items-center justify-end pr-2">
          <div className="w-2 h-2 rounded-full bg-line" />
        </div>

        {/* Screen / Video container */}
        <div className="relative w-full h-full rounded-[26px] overflow-hidden bg-bg">
          <video
            ref={videoRef}
            src={`${videoUrl}#t=0.1`}
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Showreel video preview"
            className="w-full h-full object-cover"
          />

          {/* Subtle gradient vignette to blend into frame */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>
      </div>
    </div>
  );
};

