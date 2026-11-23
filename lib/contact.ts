import { ContactFormData } from "@/types";

export const MAX_MESSAGE_LENGTH = 1000;

export interface SubmitLeadResult {
  dispatched: boolean;
  error?: string;
}

/**
 * Dispatches form contents to the /api/contact route.
 */
export async function submitLead(
  formData: ContactFormData
): Promise<SubmitLeadResult> {
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: formData.name.trim(),
        email: formData.email.trim(),
        ...(formData.phone?.trim() ? { phone: formData.phone.trim() } : {}),
        projectType: formData.projectType,
        message: formData.message.trim(),
        ...(formData.contact_lead_ref ? { contact_lead_ref: formData.contact_lead_ref } : {}),
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        dispatched: false,
        error: data.error || "Failed to send message. Please try again.",
      };
    }

    return { dispatched: true };
  } catch {
    return {
      dispatched: false,
      error: "Unable to reach the server. Please check your connection and try again.",
    };
  }
}
