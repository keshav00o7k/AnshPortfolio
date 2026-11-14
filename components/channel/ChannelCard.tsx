"use client";

import React, { useRef } from "react";
import { ChannelVideo } from "@/types";

interface ChannelCardProps {
  video: ChannelVideo;
  onClick: (video: ChannelVideo, element: HTMLElement) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ video, onClick }) => {
  const cardRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (cardRef.current) {
      onClick(video, cardRef.current);
    }
  };

  return (
    <button
      ref={cardRef}
      type="button"
      onClick={handleClick}
      aria-label={`Play ${video.title}`}
      className="group relative flex flex-col w-full text-left bg-surface border border-line rounded-[20px] overflow-hidden cursor-pointer shadow-md transition-all duration-300 hover:border-violet/70 hover:shadow-[0_8px_30px_rgba(124,58,237,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-lilac active:scale-[0.98]"
    >
      {/* 16:9 Thumbnail Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/40">
        {/* eslint-disable-next-line @next/next/no-img-element -- User preferred native img with fixed aspect ratio without next.config remotePatterns */}
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* Subtle dark vignette */}
        <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors pointer-events-none" />

        {/* Centered Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/70 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:bg-violet group-hover:border-violet transition-all duration-200">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="translate-x-[1px]"
            >
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </div>
        </div>
      </div>

      {/* Card Info: Real title only, no invented metrics */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <h3 className="text-xs sm:text-sm font-medium text-ink line-clamp-2 leading-snug group-hover:text-lilac transition-colors">
          {video.title}
        </h3>
      </div>
    </button>
  );
};

