"use client";

import React from "react";
import { motion } from "motion/react";
import { ServiceItem } from "@/types";
import { ServiceCard } from "@/components/services/ServiceCard";
import { SectionStarter } from "@/components/ui/SectionStarter";

interface ServicesSectionProps {
  services: ServiceItem[];
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ services }) => {
  return (
    <section
      id="services"
      aria-label="Services offered"
      className="relative w-full px-2 sm:px-4 md:px-6 py-12 sm:py-20 border-t border-line/60"
    >
      {/* Giant Faded Section Starter */}
      <SectionStarter title="SERVICES" />
      <h2 className="sr-only">Services</h2>

      {/* Grid: 1 col mobile, 2 col sm, 3 col lg, 4 col xl */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 w-full">
        {services.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
};

