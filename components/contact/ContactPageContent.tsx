"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ContactFormData, SiteConfig } from "@/types";
import { submitLead, MAX_MESSAGE_LENGTH } from "@/lib/contact";

interface ContactPageContentProps {
  siteConfig: SiteConfig;
  showBreadcrumb?: boolean;
}

const PROJECT_TYPES = [
  "YouTube long-form",
  "Shorts and reels",
  "Ads",
  "Wedding",
  "Short film",
  "Event",
  "Social media",
  "Other",
] as const;

export const ContactPageContent: React.FC<ContactPageContentProps> = ({
  showBreadcrumb = true,
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    message: "",
  });

  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isDispatched, setIsDispatched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};

    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = "Please enter your name.";
    } else if (trimmedName.length > 100) {
      newErrors.name = "Name must be 100 characters or fewer.";
    } else if (/[\x00-\x1F\x7F]/.test(trimmedName)) {
      newErrors.name = "Name contains invalid characters or line breaks.";
    }

    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      newErrors.email = "Please enter your email.";
    } else if (trimmedEmail.length > 150) {
      newErrors.email = "Email must be 150 characters or fewer.";
    } else if (/[\s,;<>"']/.test(trimmedEmail)) {
      newErrors.email = "Email contains invalid characters or delimiters.";
    } else {
      const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailPattern.test(trimmedEmail)) {
        newErrors.email = "Please enter a valid email address.";
      }
    }

    if (!formData.projectType) {
      newErrors.projectType = "Please select a project type.";
    }

    const trimmedPhone = (formData.phone || "").trim();
    if (trimmedPhone) {
      if (trimmedPhone.length < 7 || trimmedPhone.length > 25) {
        newErrors.phone = "Phone number must be between 7 and 25 characters.";
      } else if (!/^[+]?[0-9\s\-()]{7,25}$/.test(trimmedPhone)) {
        newErrors.phone = "Please enter a valid phone number (e.g. +91 98765 43210).";
      }
    }

    const trimmedMessage = formData.message.trim();
    if (!trimmedMessage) {
      newErrors.message = "Please enter a message.";
    } else if (trimmedMessage.length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    } else if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      newErrors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`;
    } else if (/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/.test(trimmedMessage)) {
      newErrors.message = "Message contains invalid control characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const result = await submitLead({
        ...formData,
        contact_lead_ref: honeypot,
      });

      if (result.dispatched) {
        setIsDispatched(true);
      } else {
        setSubmitError(result.error || "Sorry, there was an issue sending your message. Please try again.");
      }
    } catch {
      setSubmitError("Sorry, there was an issue sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      projectType: "",
      message: "",
    });
    setHoneypot("");
    setErrors({});
    setSubmitError(null);
    setIsDispatched(false);
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
        {/* Left Column: Editorial Headline & Verified Resume Facts */}
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

          {/* Verified Resume Facts Only */}
          <div className="mt-8 sm:mt-12 flex flex-col items-start gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-ink">
              <span className="rounded-md border border-line bg-surface px-3 py-1.5 shadow-xs">
                30+ long-form videos
              </span>
              <span className="rounded-md border border-line bg-surface px-3 py-1.5 shadow-xs">
                70+ reels
              </span>
              <span className="rounded-md border border-line bg-surface px-3 py-1.5 shadow-xs">
                Adobe Premiere Pro
              </span>
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
                className="p-6 sm:p-8 rounded-2xl bg-bg border border-line text-left flex flex-col items-start gap-4 animate-in fade-in duration-300"
              >
                <div className="flex items-center gap-3 text-violet font-semibold">
                  <svg
                    className="w-5 h-5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-base sm:text-lg">Thanks, your message has been sent.</span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    style={{ borderRadius: "6px 20px 6px 20px" }}
                    className="px-5 py-2.5 rounded-tl-[6px] rounded-tr-[20px] rounded-br-[6px] rounded-bl-[20px] text-xs font-semibold uppercase tracking-wider bg-violet text-white hover:bg-violet-hover transition-colors cursor-pointer shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5 sm:gap-6">
                {/* Error Banner */}
                {submitError && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="p-4 rounded-xl border border-red-200 bg-red-50/80 text-xs text-red-800 font-medium"
                  >
                    {submitError}
                  </div>
                )}

                {/* Off-screen Honeypot Field */}
                <div
                  style={{
                    position: "absolute",
                    left: "-9999px",
                    width: "1px",
                    height: "1px",
                    opacity: 0,
                    pointerEvents: "none",
                  }}
                  aria-hidden="true"
                >
                  <input
                    type="text"
                    name="contact_lead_ref"
                    id="contact_lead_ref"
                    tabIndex={-1}
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                {/* Full Name */}
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-semibold text-ink mb-2"
                  >
                    Full Name <span className="text-violet">*</span>
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    className={`w-full px-4 py-3 rounded-lg border bg-surface text-sm text-ink placeholder:text-mute/60 transition-colors focus:outline-none focus:ring-2 focus:ring-lilac/30 disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.name ? "border-red-500 focus:border-red-500" : "border-line focus:border-violet"
                    }`}
                  />
                  {errors.name && (
                    <p id="name-error" className="text-xs text-red-500 mt-1.5" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="emailAddress"
                    className="block text-xs font-semibold text-ink mb-2"
                  >
                    Email Address <span className="text-violet">*</span>
                  </label>
                  <input
                    id="emailAddress"
                    type="email"
                    required
                    maxLength={150}
                    disabled={isSubmitting}
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className={`w-full px-4 py-3 rounded-lg border bg-surface text-sm text-ink placeholder:text-mute/60 transition-colors focus:outline-none focus:ring-2 focus:ring-lilac/30 disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.email ? "border-red-500 focus:border-red-500" : "border-line focus:border-violet"
                    }`}
                  />
                  {errors.email && (
                    <p id="email-error" className="text-xs text-red-500 mt-1.5" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Mobile / WhatsApp Number */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="phoneNumber"
                      className="block text-xs font-semibold text-ink"
                    >
                      Mobile / WhatsApp Number
                    </label>
                    <span className="text-[11px] text-mute font-normal">Optional</span>
                  </div>
                  <input
                    id="phoneNumber"
                    type="tel"
                    maxLength={25}
                    disabled={isSubmitting}
                    placeholder="+91 98765 43210"
                    value={formData.phone || ""}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? "phone-error" : undefined}
                    className={`w-full px-4 py-3 rounded-lg border bg-surface text-sm text-ink placeholder:text-mute/60 transition-colors focus:outline-none focus:ring-2 focus:ring-lilac/30 disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.phone ? "border-red-500 focus:border-red-500" : "border-line focus:border-violet"
                    }`}
                  />
                  {errors.phone && (
                    <p id="phone-error" className="text-xs text-red-500 mt-1.5" role="alert">
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Project Type */}
                <div>
                  <label
                    htmlFor="projectType"
                    className="block text-xs font-semibold text-ink mb-2"
                  >
                    Project Type <span className="text-violet">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="projectType"
                      required
                      disabled={isSubmitting}
                      value={formData.projectType}
                      onChange={(e) => {
                        setFormData({ ...formData, projectType: e.target.value });
                        if (errors.projectType) setErrors({ ...errors, projectType: undefined });
                      }}
                      aria-invalid={Boolean(errors.projectType)}
                      aria-describedby={errors.projectType ? "type-error" : undefined}
                      className={`w-full px-4 py-3 rounded-lg border bg-surface text-sm transition-colors appearance-none pr-10 cursor-pointer focus:outline-none focus:ring-2 focus:ring-lilac/30 disabled:opacity-60 disabled:cursor-not-allowed ${
                        !formData.projectType ? "text-mute/70" : "text-ink"
                      } ${
                        errors.projectType ? "border-red-500 focus:border-red-500" : "border-line focus:border-violet"
                      }`}
                    >
                      <option value="" disabled>
                        Select a project type
                      </option>
                      {PROJECT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>

                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-mute">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {errors.projectType && (
                    <p id="type-error" className="text-xs text-red-500 mt-1.5" role="alert">
                      {errors.projectType}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label
                      htmlFor="message"
                      className="block text-xs font-semibold text-ink"
                    >
                      Message <span className="text-violet">*</span>
                    </label>
                    <span className="text-[11px] text-mute">
                      {formData.message.length}/{MAX_MESSAGE_LENGTH}
                    </span>
                  </div>
                  <textarea
                    id="message"
                    required
                    rows={4}
                    maxLength={MAX_MESSAGE_LENGTH}
                    disabled={isSubmitting}
                    placeholder="Tell me about your project, timeline, and goals..."
                    value={formData.message}
                    onChange={(e) => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: undefined });
                    }}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    className={`w-full px-4 py-3 rounded-lg border bg-surface text-sm text-ink placeholder:text-mute/60 transition-colors focus:outline-none focus:ring-2 focus:ring-lilac/30 resize-y disabled:opacity-60 disabled:cursor-not-allowed ${
                      errors.message ? "border-red-500 focus:border-red-500" : "border-line focus:border-violet"
                    }`}
                  />
                  {errors.message && (
                    <p id="message-error" className="text-xs text-red-500 mt-1.5" role="alert">
                      {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
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
