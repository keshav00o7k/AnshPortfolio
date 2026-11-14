"use client";

import React from "react";
import { siteConfig } from "@/lib/data";

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-line/60 bg-bg py-8 px-3 sm:px-6 mt-12 sm:mt-16">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-mute">
        <p>© {currentYear} {siteConfig.name}. All rights reserved.</p>

        <div className="flex items-center gap-6">
          {siteConfig.youtubeChannelUrl && (
            <a
              href={siteConfig.youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors min-h-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac rounded px-1"
            >
              YouTube
            </a>
          )}
          {siteConfig.instagramUrl && (
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-ink transition-colors min-h-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac rounded px-1"
            >
              Instagram
            </a>
          )}
          <button
            type="button"
            onClick={scrollToTop}
            className="hover:text-ink transition-colors cursor-pointer min-h-[44px] inline-flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-lilac rounded px-1"
          >
            Back to top
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
};
