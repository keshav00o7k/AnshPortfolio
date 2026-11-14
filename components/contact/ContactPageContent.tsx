"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ContactFormData, SiteConfig } from "@/types";
import { submitLead } from "@/lib/contact";

interface ContactPageContentProps {
  siteConfig: SiteConfig;
  showBreadcrumb?: boolean;
}

const clientAvatars = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces",
];

export const ContactPageContent: React.FC<ContactPageContentProps> = ({
  siteConfig,
  showBreadcrumb = true,
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    projectType: "",
    budget: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isDispatched, setIsDispatched] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = "Please enter your name.";
    } else if (trimmedName.length > 100) {
      newErrors.name = "Name must be 100 characters or fewer.";
    }

    const trimmedEmail = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      newErrors.email = "Please enter your email.";
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!formData.projectType) {
      newErrors.projectType = "Please select which platforms you are active on.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await submitLead(formData, siteConfig.email);
      if (result.dispatched) {
        setIsDispatched(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyEmail = () => {
    if (siteConfig.email) {
      navigator.clipboard.writeText(siteConfig.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 py-8 sm:py-16">
      {/* Breadcrumb Navigation */}
      {showBreadcrumb && (
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs uppercase tracking-wider text-mute mb-8 sm:mb-12"
        >
          <Link
            href="/"
            className="hover:text-ink transition-colors font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-lilac rounded"
          >
            HOME
          </Link>
          <span className="text-mute/60 select-none">&gt;</span>
          <span className="text-ink font-semibold">Contact</span>
        </motion.nav>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: Editorial Headline & Social Proof */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 flex flex-col justify-start"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-ink font-[family-name:var(--font-bricolage)] leading-[1.08]">
            Let&apos;s Create{" "}
            <span className="block font-[family-name:var(--font-playfair)] italic font-normal text-violet mt-1.5 sm:mt-2">
              Something Worth
            </span>
            <span className="block font-[family-name:var(--font-playfair)] italic font-normal text-violet">
              Watching.
            </span>
          </h1>

          {/* Social Proof: Avatars & Rating */}
          <div className="mt-8 sm:mt-12 flex flex-col items-start gap-3">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2.5 overflow-hidden">
                {clientAvatars.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`Creator ${i + 1}`}
                    loading="lazy"
                    className="inline-block h-9 w-9 sm:h-10 sm:w-10 rounded-full ring-2 ring-surface object-cover shadow-sm"
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-ink">4.9/5</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-mute">
              <span>15M+ views generated on</span>
              <span className="text-violet tracking-widest text-sm">★★★★★</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Contact Form Card */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="lg:col-span-7 w-full"
        >
          <div className="bg-surface border border-line rounded-[24px] sm:rounded-[32px] p-6 sm:p-10 shadow-xl w-full">
            {isDispatched ? (
              <div
                role="status"
                aria-live="polite"
                className="p-6 rounded-2xl bg-bg border border-line text-left flex flex-col gap-4 animate-in fade-in duration-300"
              >
                <div className="flex items-center gap-3 text-violet font-semibold">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  <span className="text-base sm:text-lg">Email Client Triggered</span>
                </div>

                <p className="text-sm text-mute leading-relaxed">
                  Your default email app should open with your project details. If it did not
                  launch automatically, you can email me directly at:
                </p>

                <p className="text-sm sm:text-base font-semibold text-ink break-all">
                  {siteConfig.email}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    style={{ borderRadius: "6px 20px 6px 20px" }}
                    className="px-5 py-2.5 rounded-tl-[6px] rounded-tr-[20px] rounded-br-[6px] rounded-bl-[20px] text-xs font-semibold uppercase tracking-wider bg-violet text-white hover:bg-violet-hover transition-colors cursor-pointer shadow-sm"
                  >
                    {copied ? "Copied to clipboard!" : "Copy Email Address"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDispatched(false)}
                    className="text-xs text-mute hover:text-ink underline transition-colors cursor-pointer ml-2"
                  >
                    Edit form
                  </button>
                </div>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold text-ink mb-2"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={`w-full px-4 py-3 rounded-lg border bg-surface text-sm text-ink placeholder:text-mute/60 transition-colors focus:outline-none focus:ring-2 focus:ring-lilac/30 ${
                      errors.name ? "border-red-500 focus:border-red-500" : "border-line focus:border-violet"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.name}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="emailAddress"
                    className="block text-xs font-semibold text-ink mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="emailAddress"
                    type="email"
                    required
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    className={`w-full px-4 py-3 rounded-lg border bg-surface text-sm text-ink placeholder:text-mute/60 transition-colors focus:outline-none focus:ring-2 focus:ring-lilac/30 ${
                      errors.email ? "border-red-500 focus:border-red-500" : "border-line focus:border-violet"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>
                  )}
                </div>

                {/* Which platforms are you active on? */}
                <div>
                  <label
                    htmlFor="platforms"
                    className="block text-xs font-semibold text-ink mb-2"
                  >
                    Which platforms are you active on?
                  </label>
                  <div className="relative">
                    <select
                      id="platforms"
                      required
                      value={formData.projectType}
                      onChange={(e) => {
                        setFormData({ ...formData, projectType: e.target.value });
                        if (errors.projectType) setErrors({ ...errors, projectType: undefined });
                      }}
                      className={`w-full px-4 py-3 rounded-lg border bg-surface text-sm transition-colors appearance-none pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-lilac/30 ${
                        !formData.projectType ? "text-mute/70" : "text-ink"
                      } ${
                        errors.projectType ? "border-red-500 focus:border-red-500" : "border-line focus:border-violet"
                      }`}
                    >
                      <option value="" disabled>
                        Enter Platforms
                      </option>
                      <option value="YouTube Long-form">YouTube Long-form</option>
                      <option value="Instagram Reels">Instagram Reels</option>
                      <option value="YouTube Shorts & TikTok">YouTube Shorts &amp; TikTok</option>
                      <option value="Multi-Platform Creator">Multi-Platform Creator</option>
                      <option value="Commercial & Brand Ads">Commercial &amp; Brand Ads</option>
                      <option value="Other Project">Other / Custom Editing</option>
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-mute">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {errors.projectType && (
                    <p className="text-xs text-red-500 mt-1.5">{errors.projectType}</p>
                  )}
                </div>

                {/* Budget range */}
                <div>
                  <label
                    htmlFor="budgetRange"
                    className="block text-xs font-semibold text-ink mb-2"
                  >
                    Budget range
                  </label>
                  <div className="relative">
                    <select
                      id="budgetRange"
                      value={formData.budget || ""}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                      className={`w-full px-4 py-3 rounded-lg border bg-surface text-sm border-line focus:border-violet focus:outline-none focus:ring-2 focus:ring-lilac/30 transition-colors appearance-none pr-10 cursor-pointer ${
                        !formData.budget ? "text-mute/70" : "text-ink"
                      }`}
                    >
                      <option value="" disabled>
                        Select Budget Range
                      </option>
                      <option value="< $500">&lt; $500</option>
                      <option value="$500 - $1,500">$500 – $1,500</option>
                      <option value="$1,500 - $3,000">$1,500 – $3,000</option>
                      <option value="$3,000+">$3,000+</option>
                      <option value="Flexible / Retainer">Flexible / Retainer</option>
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-mute">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* SEND MESSAGE Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{ borderRadius: "6px 30px 6px 30px" }}
                    className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-violet bg-white text-violet font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-[2px_2px_0px_0px_#3F1345] hover:bg-violet hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

