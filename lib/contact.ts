import { ContactFormData } from "@/types";

/**
 * Maximum character length allowed for contact messages.
 * Note: Set to 1,000 for mailto URL encoding stability;
 * can be raised once a backend API replaces mailto.
 */
export const MAX_MESSAGE_LENGTH = 1000;

export interface SubmitLeadResult {
  dispatched: boolean;
  error?: string;
}

/**
 * Frontend lead submission handler.
 * Dispatches form contents via mailto: protocol to the configured email recipient.
 */
export async function submitLead(
  formData: ContactFormData,
  recipientEmail: string
): Promise<SubmitLeadResult> {
  // =========================================================================
  // FUTURE MONGODB / BACKEND API SWAP POINT (Phase B)
  // =========================================================================
  // When ready to persist leads in MongoDB, replace the mailto dispatch with:
  //
  // const res = await fetch("/api/contact", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(formData),
  // });
  // if (!res.ok) throw new Error("Failed to submit enquiry");
  // return { dispatched: true };
  // =========================================================================

  if (!recipientEmail || recipientEmail.trim() === "") {
    return {
      dispatched: false,
      error: "No recipient email address configured.",
    };
  }

  const subject = `[Project Enquiry] ${formData.projectType || "Video Editing"} - ${formData.name.trim()}`;
  const budgetLine = formData.budget ? `Budget: ${formData.budget}\r\n` : "";
  const body = `Name: ${formData.name.trim()}\r\nEmail: ${formData.email.trim()}\r\nPlatforms / Project: ${formData.projectType}\r\n${budgetLine}\r\nMessage:\r\n${formData.message.trim()}`;

  const mailtoUrl = `mailto:${recipientEmail.trim()}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;

  // Open the user's default email client
  window.location.href = mailtoUrl;

  return { dispatched: true };
}

