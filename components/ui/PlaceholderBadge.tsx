import React from "react";

interface PlaceholderBadgeProps {
  label?: string;
  className?: string;
}

export const PlaceholderBadge: React.FC<PlaceholderBadgeProps> = ({
  label = "Placeholder",
  className = "",
}) => {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium tracking-wide uppercase bg-surface/90 border border-violet/40 text-lilac backdrop-blur-md shadow-sm ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" />
      {label}
    </span>
  );
};

