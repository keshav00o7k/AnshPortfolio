import React from "react";
import { ExperienceItem } from "@/types";

interface ExperienceCardProps {
  experience: ExperienceItem;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience }) => {
  return (
    <div className="p-5 sm:p-6 rounded-[20px] bg-surface border border-line flex flex-col justify-between transition-all duration-300 hover:border-line/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-2.5">
        <h4 className="text-sm sm:text-base font-semibold text-ink font-display">
          {experience.clientType}
        </h4>
        <span className="font-mono text-xs text-mute tabular-nums tracking-wider self-start sm:self-auto px-2 py-0.5 rounded bg-bg/60 border border-line">
          {experience.period}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-mute leading-relaxed">
        {experience.description}
      </p>
    </div>
  );
};

