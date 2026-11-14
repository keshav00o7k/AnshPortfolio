"use client";

import React from "react";
import { SiteConfig } from "@/types";
import { ContactPageContent } from "@/components/contact/ContactPageContent";

interface ContactSectionProps {
  siteConfig: SiteConfig;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ siteConfig }) => {
  return (
    <section
      id="contact"
      aria-label="Contact and project enquiries"
      className="relative w-full border-t border-line/60 scroll-mt-24"
    >
      <ContactPageContent siteConfig={siteConfig} showBreadcrumb={false} />
    </section>
  );
};
