"use client";

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ModalVideoItem } from "@/types";

interface VideoModalProps {
  item?: ModalVideoItem | null;
  project?: ModalVideoItem | null;
  onClose: () => void;
  triggerElement: HTMLElement | null;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  item,
  project,
  onClose,
  triggerElement,
}) => {
  const videoItem = item || project || null;
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Return focus to triggering element on close
  useEffect(() => {
    return () => {
      if (triggerElement) {
        triggerElement.focus();
      }
    };
  }, [triggerElement]);

  // Lock body scroll and trap keyboard focus
  useEffect(() => {
    if (!videoItem) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), video, iframe'
        );
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [videoItem, onClose]);

  if (!videoItem) return null;

  const isLandscape = videoItem.format === "16:9" || Boolean(videoItem.youtubeId);

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-video-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={`relative z-10 bg-surface border border-line rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-2xl flex flex-col ${
            isLandscape
              ? "w-full max-w-4xl aspect-[16/9] max-h-[85vh]"
              : "w-auto max-w-[min(90vw,calc(85vh*9/16))] h-full max-h-[85vh] aspect-[9/16]"
          }`}
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 sm:py-3 border-b border-line/60 bg-surface/90 backdrop-blur-sm z-20">
            <h3
              id="modal-video-title"
              className="text-xs sm:text-sm font-medium text-ink tracking-wide truncate max-w-[75%]"
            >
              {videoItem.title.toLowerCase().startsWith("reel") ? "Selected Work" : videoItem.title}
            </h3>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              aria-label="Close modal"
              className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full flex items-center justify-center text-mute hover:text-ink hover:bg-line transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-lilac"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Player Container */}
          <div className="relative flex-1 w-full bg-black flex items-center justify-center overflow-hidden">
            {videoItem.youtubeId ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${videoItem.youtubeId}?autoplay=1&rel=0`}
                title={videoItem.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : videoItem.videoUrl ? (
              <video
                src={videoItem.videoUrl}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-cover"
                aria-label={`${videoItem.title} full video`}
              />
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
