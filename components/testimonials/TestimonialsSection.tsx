"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TestimonialItem } from "@/types";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";
import { SectionStarter } from "@/components/ui/SectionStarter";

interface TestimonialsSectionProps {
  testimonials: TestimonialItem[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  testimonials,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const total = testimonials.length;

  const next = useCallback(() => {
    if (total <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prev = useCallback(() => {
    if (total <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goTo = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Keyboard navigation when focused on container
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    }
  };

  // Auto-advance every 7 seconds, paused on hover or user interaction
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      next();
    }, 7000);

    return () => clearInterval(timer);
  }, [total, isPaused, next]);

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  const current = testimonials[currentIndex];

  return (
    <section
      id="testimonials"
      aria-label="Client feedback"
      className="relative w-full px-2 sm:px-4 md:px-6 py-12 sm:py-20 border-t border-line/60"
    >
      {/* Giant Faded Section Starter */}
      <SectionStarter title="TESTIMONIALS" />
      <h2 className="sr-only">Client Testimonials</h2>

      {/* Main Testimonial Card */}
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocus={() => setIsPaused(true)}
        onBlur={() => setIsPaused(false)}
        aria-roledescription="carousel"
        aria-label="Client testimonials carousel"
        className="relative max-w-6xl mx-auto outline-none focus-visible:ring-2 focus-visible:ring-lilac rounded-[28px]"
      >
        <div className="relative overflow-hidden min-h-[360px] sm:min-h-[320px] rounded-[24px] sm:rounded-[28px] border border-line bg-surface shadow-2xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current.id}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 24 : -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction > 0 ? -24 : 24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col md:flex-row items-stretch w-full h-full"
            >
              {/* Left Column: Headshot / Avatar Container */}
              <div className="relative w-full md:w-[320px] lg:w-[360px] aspect-[4/3] md:aspect-auto flex-shrink-0 bg-bg overflow-hidden border-b md:border-b-0 md:border-r border-line flex items-center justify-center">
                {current.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={current.photoUrl}
                    alt={current.name}
                    loading="lazy"
                    decoding="async"
                    className={`w-full h-full ${
                      current.photoUrl.includes("brand-02")
                        ? "object-contain p-8 sm:p-10 bg-white"
                        : "object-cover object-center"
                    }`}
                  />
                ) : (
                  <div className="w-full h-full min-h-[220px] md:min-h-[320px] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-surface via-bg to-surface text-center">
                    {/* Stylized Silhouette Avatar */}
                    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-line flex items-center justify-center text-mute mb-3 shadow-inner">
                      <svg
                        className="w-10 h-10 md:w-12 md:h-12 text-mute"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="text-xs font-mono text-mute uppercase tracking-wider">
                      Client Profile
                    </span>
                  </div>
                )}
              </div>

              {/* Right Column: Quote, Stars, Author & Navigation */}
              <div className="flex-1 p-6 sm:p-8 md:p-10 flex flex-col justify-between">
                <div>
                  {/* Quote Body */}
                  <blockquote className="text-sm sm:text-base md:text-lg text-ink leading-relaxed font-normal">
                    &ldquo;{current.quote}&rdquo;
                  </blockquote>

                  {/* 5 Stars Rating */}
                  <div
                    className="flex items-center gap-1.5 my-4 sm:my-5"
                    aria-label={`Rating: ${current.rating} out of 5 stars`}
                  >
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                          i < current.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-line fill-line"
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1"
                        aria-hidden="true"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Bottom Bar: Author Identity & Controls */}
                <div className="flex items-center justify-between gap-4 mt-6 pt-5 border-t border-line/60">
                  <div className="flex flex-col text-left truncate mr-2">
                    <h3 className="text-base sm:text-lg font-semibold text-ink font-display truncate">
                      {current.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-mute truncate">
                      {current.role}
                    </p>
                  </div>

                  {/* Previous / Next Arrow Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={prev}
                      aria-label="Previous testimonial"
                      className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full border border-line bg-surface hover:bg-line hover:border-lilac text-ink flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      aria-label="Next testimonial"
                      className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full border border-line bg-surface hover:bg-line hover:border-lilac text-ink flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac cursor-pointer"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination Indicator Dots */}
      {total > 1 && (
        <div
          className="flex items-center justify-center gap-2 mt-6"
          role="tablist"
          aria-label="Testimonial pagination"
        >
          {testimonials.map((item, idx) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={idx === currentIndex}
              aria-label={`Go to testimonial ${idx + 1}`}
              onClick={() => goTo(idx)}
              className={`h-2 transition-all duration-300 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac ${
                idx === currentIndex
                  ? "w-7 bg-lilac"
                  : "w-2 bg-line hover:bg-mute/60"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

