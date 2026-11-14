import React from "react";
import { ServiceItem } from "@/types";

interface ServiceCardProps {
  service: ServiceItem;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  return (
    <div className="group relative p-6 sm:p-7 rounded-[20px] bg-surface border border-line transition-all duration-300 hover:border-violet/70 hover:shadow-[0_8px_30px_rgba(124,58,237,0.12)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="font-mono text-xs text-mute tracking-wider uppercase px-2 py-0.5 rounded bg-bg/60 border border-line">
            {service.number}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-ink font-display mb-2 group-hover:text-lilac transition-colors">
          {service.title}
        </h3>
      </div>
      <p className="text-sm text-mute leading-relaxed mt-2">
        {service.description}
      </p>
    </div>
  );
};

