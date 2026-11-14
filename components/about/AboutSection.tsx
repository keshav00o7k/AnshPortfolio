"use client";

import React from "react";
import { motion } from "motion/react";
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
      className="relative w-full px-2 sm:px-4 md:px-6 py-12 sm:py-20 border-t border-line/60"
    >
      {/* Giant Faded Section Starter */}
      <SectionStarter title="ABOUT" />
      <h2 className="sr-only">About Ansh Vaishnav</h2>

      {/* Top Block: Photo + Bio & Tool Badge */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12 mb-12 sm:mb-16">
        <PhotoPlaceholder
          photoUrl={aboutConfig.photoUrl}
          isPlaceholder={aboutConfig.isPlaceholderPhoto}
        />

        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          {/* Primary Tool Badge (Text only, no logos) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface border border-line text-xs font-medium text-lilac mb-4">
            <span>Primary tool:</span>
            <span className="text-ink font-semibold">{aboutConfig.toolBadge}</span>
          </div>

          {/* Short Bio */}
          <p className="text-sm sm:text-base text-mute leading-relaxed max-w-2xl mb-8">
            {aboutConfig.bio}
          </p>

          {/* 3 Proof Numbers (Static text, no count-up) */}
          <ProofNumbers metrics={proofMetrics} />
        </div>
      </div>

      {/* Anonymous Experience Timeline */}
      <div className="mt-8">
        <h3 className="text-xl sm:text-2xl font-semibold text-ink font-display mb-6 text-center md:text-left">
          Work history
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4 w-full">
          {experiences.map((exp) => (
            <ExperienceCard key={exp.id} experience={exp} />
          ))}
        </div>
      </div>
    </section>
  );
};

