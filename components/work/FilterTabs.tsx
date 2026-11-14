"use client";

import React from "react";

export interface FilterOption {
  id: string;
  label: string;
}

interface FilterTabsProps {
  options: FilterOption[];
  activeFilter: string;
  onChange: (id: string) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  options,
  activeFilter,
  onChange,
}) => {
  // Show filter chips only when there are 2 or more options
  if (options.length < 2) {
    return null;
  }

  return (
    <div
      role="tablist"
      aria-label="Filter projects"
      className="flex flex-wrap items-center justify-center gap-2 mb-8 sm:mb-12"
    >
      {options.map((option) => {
        const isSelected = activeFilter === option.id;
        return (
          <button
            key={option.id}
            role="tab"
            aria-selected={isSelected}
            onClick={() => onChange(option.id)}
            style={{ borderRadius: "6px 20px 6px 20px" }}
            className={`px-4 py-2 rounded-tl-[6px] rounded-tr-[20px] rounded-br-[6px] rounded-bl-[20px] text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac ${
              isSelected
                ? "bg-violet text-white shadow-[0_2px_12px_rgba(63,19,69,0.25)]"
                : "bg-surface text-mute border border-line hover:text-ink hover:border-lilac/50"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

