"use client";

import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Project, SiteConfig } from "@/types";
import { FilterTabs, FilterOption } from "@/components/work/FilterTabs";
import { WorkGrid } from "@/components/work/WorkGrid";
import { Button } from "@/components/ui/Button";
import { SectionStarter } from "@/components/ui/SectionStarter";

interface WorkSectionProps {
  projects: Project[];
  siteConfig: SiteConfig;
}

export const WorkSection: React.FC<WorkSectionProps> = ({
  projects,
  siteConfig,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // Derive filter options dynamically from project categories/formats
  // Renders only when there are 2 or more distinct options
  const filterOptions = useMemo<FilterOption[]>(() => {
    const categories = new Set(projects.map((p) => p.category));
    if (categories.size < 2) return [];

    const options: FilterOption[] = [{ id: "all", label: "All" }];
    categories.forEach((cat) => {
      options.push({
        id: cat,
        label:
          cat === "reel"
            ? "Reels"
            : cat === "youtube"
            ? "YouTube"
            : cat.charAt(0).toUpperCase() + cat.slice(1),
      });
    });
    return options;
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") return projects;
    return projects.filter((p) => p.category === activeFilter);
  }, [projects, activeFilter]);

  return (
    <section
      id="work"
      aria-label="Selected work"
      className="relative w-full px-2 sm:px-4 md:px-6 py-12 sm:py-20"
    >
      {/* Giant Faded Section Starter */}
      <SectionStarter title="WORK" />
      <h2 className="sr-only">Selected Work</h2>

      {/* Filter chips (only renders when 2+ options exist) */}
      <FilterTabs
        options={filterOptions}
        activeFilter={activeFilter}
        onChange={setActiveFilter}
      />

      {/* Grid of project cards */}
      <WorkGrid projects={filteredProjects} />

      {/* "More samples" button using driveUrl, omitted if empty */}
      {siteConfig.driveUrl && siteConfig.driveUrl.trim() !== "" && (
        <div className="mt-12 sm:mt-16 flex justify-center">
          <Button
            asLink
            href={siteConfig.driveUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="secondary"
            size="md"
          >
            More samples on Google Drive →
          </Button>
        </div>
      )}
    </section>
  );
};

