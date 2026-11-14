import React from "react";
import { ProofMetric } from "@/types";

interface ProofNumbersProps {
  metrics: ProofMetric[];
}

export const ProofNumbers: React.FC<ProofNumbersProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 max-w-4xl w-full">
      {metrics.map((metric, idx) => (
        <div
          key={idx}
          className="p-5 sm:p-5.5 rounded-[22px] bg-surface border border-line flex items-center gap-4 transition-all duration-300 hover:border-violet/40 hover:shadow-sm"
        >
          {/* Prominent Stat Number */}
          <span className="font-display text-3xl sm:text-4xl lg:text-[40px] font-bold text-violet tracking-tight shrink-0">
            {metric.value}
          </span>

          {/* Label and Detail column */}
          <div className="flex flex-col text-left min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-ink leading-snug truncate">
              {metric.label}
            </span>
            <span className="text-[11px] sm:text-xs text-mute leading-relaxed mt-0.5 line-clamp-2">
              {metric.detail}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
