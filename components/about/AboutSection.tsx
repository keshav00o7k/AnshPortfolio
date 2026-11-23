"use client";

import React from "react";
import { AboutConfig, ExperienceItem, ProofMetric } from "@/types";
import { PhotoPlaceholder } from "@/components/about/PhotoPlaceholder";
import { ProofNumbers } from "@/components/about/ProofNumbers";
import { ExperienceCard } from "@/components/about/ExperienceCard";
import { SectionStarter } from "@/components/ui/SectionStarter";

interface AboutSectionProps {
  aboutConfig: AboutConfig;
  proofMetrics: ProofMetric[];
  experiences: ExperienceItem[];
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  aboutConfig,
  proofMetrics,
  experiences,
}) => {
  return (
    <section
      id="about"
      aria-label="About Ansh Vaishnav"
      className="relative w-full py-12 sm:py-20 border-t border-line/60"
    >
      {/* Giant Faded Section Starter */}
      <SectionStarter title="ABOUT" />
      <h2 className="sr-only">About Ansh Vaishnav</h2>

      {/* Centered Main Content Container */}
      <div className="max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Top Block: Photo + Bio & Tool Badge */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 xl:gap-16 items-center mb-16 sm:mb-20">
          {/* Photo Column */}
          <div className="lg:col-span-5 xl:col-span-4 flex justify-center lg:justify-start w-full">
            <PhotoPlaceholder
              photoUrl={aboutConfig.photoUrl}
              isPlaceholder={aboutConfig.isPlaceholderPhoto}
            />
          </div>

          {/* Bio & Proof Stats Column */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center lg:items-start text-center lg:text-left w-full">
            {/* Primary Tool Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-line text-xs sm:text-sm font-medium text-lilac mb-4 sm:mb-5 shadow-2xs">
              <span>Primary tool:</span>
              <span className="text-ink font-semibold">{aboutConfig.toolBadge}</span>
            </div>

            {/* Short Bio */}
            <p className="text-base sm:text-lg text-mute leading-relaxed mb-8 sm:mb-10 font-normal">
              {aboutConfig.bio}
            </p>

            {/* 3 Proof Numbers */}
            <ProofNumbers metrics={proofMetrics} />
          </div>
        </div>

        {/* Work history */}
        <div className="pt-10 sm:pt-14 border-t border-line/60">
          <h3 className="text-xl sm:text-2xl font-semibold text-ink font-display mb-6 text-center lg:text-left">
            Work history
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 w-full">
            {experiences.map((exp) => (
              <ExperienceCard key={exp.id} experience={exp} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

