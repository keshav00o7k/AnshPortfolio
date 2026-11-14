"use client";

import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Project } from "@/types";

function subscribeHover(callback: () => void) {
  const mql = window.matchMedia("(hover: hover)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getHoverSnapshot() {
  return !window.matchMedia("(hover: hover)").matches;
}

function getServerSnapshot() {
  return false;
}

interface ProjectCardProps {
  project: Project;
  isActive: boolean;
  onHover: (id: string) => void;
  onLeave: () => void;
  onInView: (id: string) => void;
  onClick: (project: Project, element: HTMLElement) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isActive,
  onHover,
  onLeave,
  onInView,
  onClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const isTouchDevice = useSyncExternalStore(
    subscribeHover,
    getHoverSnapshot,
    getServerSnapshot
  );

  // Lazy-load video src when near viewport
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const nearObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsNearViewport(true);
            nearObserver.disconnect();
          }
        });
      },
      { rootMargin: "300px" }
    );

    nearObserver.observe(container);

    return () => nearObserver.disconnect();
  }, []);

  // On touch devices, observe when card is centered in view
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isTouchDevice) return;

    const inViewObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onInView(project.id);
          }
        });
      },
      { threshold: 0.6 }
    );

    inViewObserver.observe(container);

    return () => inViewObserver.disconnect();
  }, [isTouchDevice, project.id, onInView]);

  // Handle play / pause based on isActive & prefers-reduced-motion
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isNearViewport) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (isActive && !prefersReducedMotion) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [isActive, isNearViewport]);

  const handleClick = () => {
    if (containerRef.current) {
      onClick(project, containerRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      ref={containerRef}
      role="button"
      tabIndex={0}
      aria-label={`Open ${project.title}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => {
        if (!isTouchDevice) onHover(project.id);
      }}
      onMouseLeave={() => {
        if (!isTouchDevice) onLeave();
      }}
      className="group relative aspect-[9/16] w-full rounded-[20px] overflow-hidden bg-surface border border-line cursor-pointer shadow-md transition-all duration-300 hover:border-violet/70 hover:shadow-[0_8px_30px_rgba(124,58,237,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-lilac active:scale-[0.98]"
    >
      {/* Video layer */}
      {isNearViewport ? (
        <video
          ref={videoRef}
          src={`${project.videoUrl}#t=0.1`}
          muted
          loop
          playsInline
          preload="metadata"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          aria-hidden="true"
        />
      ) : (
        <div className="w-full h-full bg-surface" />
      )}

      {/* Subtle hover overlay */}
      <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent pointer-events-none transition-colors duration-300" />

      {/* Play indicator icon badge */}
      <div className="absolute top-3 right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-80 group-hover:opacity-100 group-hover:bg-violet group-hover:border-violet transition-all duration-200">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="translate-x-[1px]"
        >
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
      </div>

      {/* Screen-reader label */}
      <span className="sr-only">{project.title}</span>
    </div>
  );
};
