"use client";

import React from "react";
import { SectionStarter } from "@/components/ui/SectionStarter";

export const WorkSection: React.FC = () => {
  return (
    <section
      id="work"
      aria-label="Selected work"
      className="relative w-full pt-6 sm:pt-10 pb-0 scroll-mt-24"
    >
      {/* Giant Faded Section Starter: "WORK" */}
      <SectionStarter title="WORK" className="-mb-4 sm:-mb-8 md:-mb-10" />
      <h2 className="sr-only">Selected Work</h2>
    </section>
  );
};
