"use client";

import React, { useState } from "react";
import { ContactFormData, ContactProjectType } from "@/types";
import { MAX_MESSAGE_LENGTH, submitLead } from "@/lib/contact";
import { Button } from "@/components/ui/Button";

const PROJECT_TYPES: ContactProjectType[] = [
  "YouTube long-form",
  "Shorts and reels",
  "Ads",
  "Wedding",
  "Short film",
  "Event",
  "Social media",
  "Other",
];

interface ContactFormProps {
  emailRecipient: string;
}

export const ContactForm: React.FC<ContactFormProps> = ({ emailRecipient }) => {
  const isDev = process.env.NODE_ENV === "development";
  const hasEmail = Boolean(emailRecipient && emailRecipient.trim() !== "");

  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    projectType: "",
    message: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isDispatched, setIsDispatched] = useState(false);
  const [copied, setCopied] = useState(false);

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
    } else if (trimmedEmail.length > 150) {
      newErrors.email = "Email must be 150 characters or fewer.";
    }

    if (!formData.projectType) {
      newErrors.projectType = "Please select a project type.";
    }

    const trimmedMessage = formData.message.trim();
    if (!trimmedMessage) {
      newErrors.message = "Please enter a message.";
    } else if (trimmedMessage.length < 10) {
      newErrors.message = "Message must be at least 10 characters.";
    } else if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      newErrors.message = `Message must be ${MAX_MESSAGE_LENGTH} characters or fewer.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    if (!hasEmail) return;

    await submitLead(formData, emailRecipient);
    setIsDispatched(true);
  };

  const handleCopyEmail = async () => {
    if (!emailRecipient) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(emailRecipient);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = emailRecipient;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback gracefully
    }
  };

  if (isDispatched) {
    return (
      <div className="p-6 sm:p-8 rounded-[24px] bg-surface border border-line flex flex-col items-start gap-4 text-left">
        <div className="flex items-center gap-2.5 text-lilac font-medium">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
          <span className="text-sm sm:text-base">Email Client Triggered</span>
        </div>

        <p className="text-sm text-mute leading-relaxed">
          Your email app should open. If nothing happened, email me at{" "}
          <span className="text-ink font-semibold">{emailRecipient}</span>.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCopyEmail}
            style={{ borderRadius: "6px 20px 6px 20px" }}
            className="px-4 py-2 rounded-tl-[6px] rounded-tr-[20px] rounded-br-[6px] rounded-bl-[20px] text-xs sm:text-sm font-medium bg-line text-ink hover:text-white transition-colors cursor-pointer border border-line"
          >
            {copied ? "Copied to clipboard!" : "Copy email"}
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
    );
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="p-6 sm:p-8 rounded-[24px] bg-surface border border-line flex flex-col gap-5 text-left w-full shadow-lg"
    >
      {/* Dev Notice when email is empty in development */}
      {isDev && !hasEmail && (
        <div className="p-3.5 rounded-xl bg-violet/10 border border-violet/30 text-xs text-lilac">
          <strong>Development Notice:</strong> siteConfig.email is empty. Submit button is disabled until an email address is set in lib/data.ts.
        </div>
      )}

      {/* Name Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-name" className="text-xs sm:text-sm font-medium text-ink">
          Name <span className="text-violet">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          maxLength={100}
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: undefined });
          }}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          placeholder="Your name"
          className={`w-full px-4 py-2.5 rounded-xl bg-bg border text-ink text-sm placeholder:text-mute/60 focus:outline-none transition-colors ${
            errors.name ? "border-error focus:border-error" : "border-line focus:border-lilac"
          }`}
        />
        {errors.name && (
          <span id="name-error" role="alert" aria-live="polite" className="text-xs text-error font-medium">
            {errors.name}
          </span>
        )}
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-email" className="text-xs sm:text-sm font-medium text-ink">
          Email <span className="text-violet">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          maxLength={150}
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: undefined });
          }}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          placeholder="your.email@example.com"
          className={`w-full px-4 py-2.5 rounded-xl bg-bg border text-ink text-sm placeholder:text-mute/60 focus:outline-none transition-colors ${
            errors.email ? "border-error focus:border-error" : "border-line focus:border-lilac"
          }`}
        />
        {errors.email && (
          <span id="email-error" role="alert" aria-live="polite" className="text-xs text-error font-medium">
            {errors.email}
          </span>
        )}
      </div>

      {/* Project Type Select */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-project-type" className="text-xs sm:text-sm font-medium text-ink">
          Project type <span className="text-violet">*</span>
        </label>
        <select
          id="contact-project-type"
          value={formData.projectType}
          onChange={(e) => {
            setFormData({
              ...formData,
              projectType: e.target.value as ContactProjectType,
            });
            if (errors.projectType) setErrors({ ...errors, projectType: undefined });
          }}
          aria-invalid={Boolean(errors.projectType)}
          aria-describedby={errors.projectType ? "project-type-error" : undefined}
          className={`w-full px-4 py-2.5 rounded-xl bg-bg border text-ink text-sm focus:outline-none transition-colors cursor-pointer ${
            errors.projectType ? "border-error focus:border-error" : "border-line focus:border-lilac"
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
        {errors.projectType && (
          <span id="project-type-error" role="alert" aria-live="polite" className="text-xs text-error font-medium">
            {errors.projectType}
          </span>
        )}
      </div>

      {/* Message Textarea */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="contact-message" className="text-xs sm:text-sm font-medium text-ink">
            Message <span className="text-violet">*</span>
          </label>
          <span className="text-[11px] font-mono text-mute tabular-nums">
            {formData.message.length}/{MAX_MESSAGE_LENGTH}
          </span>
        </div>
        <textarea
          id="contact-message"
          rows={4}
          maxLength={MAX_MESSAGE_LENGTH}
          value={formData.message}
          onChange={(e) => {
            setFormData({ ...formData, message: e.target.value });
            if (errors.message) setErrors({ ...errors, message: undefined });
          }}
          aria-invalid={Boolean(errors.message)}
          aria-describedby={errors.message ? "message-error" : undefined}
          placeholder="Tell me about your footage, deadlines, and project goals..."
          className={`w-full px-4 py-2.5 rounded-xl bg-bg border text-ink text-sm placeholder:text-mute/60 focus:outline-none transition-colors resize-y min-h-[100px] ${
            errors.message ? "border-error focus:border-error" : "border-line focus:border-lilac"
          }`}
        />
        {errors.message && (
          <span id="message-error" role="alert" aria-live="polite" className="text-xs text-error font-medium">
            {errors.message}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          size="md"
          className="w-full"
          disabled={isDev && !hasEmail}
        >
          Send enquiry
        </Button>
      </div>
    </form>
  );
};

