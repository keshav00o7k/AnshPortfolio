import { NextRequest } from "next/server.js";

export const ALLOWED_PROJECT_TYPES = [
  "YouTube long-form",
  "Shorts and reels",
  "Ads",
  "Wedding",
  "Short film",
  "Event",
  "Social media",
  "Other",
] as const;

export type AllowedProjectType = (typeof ALLOWED_PROJECT_TYPES)[number];

export const MAX_MESSAGE_LENGTH = 1000;

/**
 * Returns the Resend API base URL.
 * Strictly ignores any non-local override to prevent arbitrary host redirection.
 */
export function getResendBaseUrl(): string {
  const override = process.env.RESEND_BASE_URL_OVERRIDE;
  if (!override) return "https://api.resend.com";

  try {
    const parsed = new URL(override);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return override.replace(/\/+$/, "");
    }
  } catch {
    // Malformed URL, ignore override
  }

  // Any non-local host is strictly ignored for security
  return "https://api.resend.com";
}

/**
 * Origin-only validation: returns true if Origin matches Host.
 * Rejects missing or mismatched Origin. No Referer fallback.
 */
export function verifyContactOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const host = request.headers.get("host");
  if (!host) return false;

  try {
    const originUrl = new URL(origin);
    return originUrl.host === host;
  } catch {
    return false;
  }
}

/**
 * Resolves the client IP for rate limiting based on Vercel and Next.js standards.
 * Reads the first IP from x-forwarded-for, then x-real-ip, falling back to 127.0.0.1.
 */
export function getClientIp(request: NextRequest): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp && xRealIp.trim()) {
    return xRealIp.trim();
  }

  return "127.0.0.1";
}

// In-memory sliding window rate limiter (max 3 submissions per 10 minutes per IP)
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 3;
const ipRequestHistory = new Map<string, number[]>();

export function checkContactRateLimit(ip: string): boolean {
  const now = Date.now();
  const history = ipRequestHistory.get(ip) || [];

  // Filter timestamps within current window
  const activeHistory = history.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  if (activeHistory.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  activeHistory.push(now);
  ipRequestHistory.set(ip, activeHistory);

  // Periodic cleanup if map grows
  if (ipRequestHistory.size > 1000) {
    for (const [key, timestamps] of ipRequestHistory.entries()) {
      const valid = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
      if (valid.length === 0) {
        ipRequestHistory.delete(key);
      } else {
        ipRequestHistory.set(key, valid);
      }
    }
  }

  return true;
}

export interface ValidatedContactInput {
  name: string;
  email: string;
  phone?: string;
  projectType: AllowedProjectType;
  message: string;
}

export type ValidationResult =
  | { success: true; data: ValidatedContactInput }
  | { success: false; error: string };

/**
 * Hand-written validation rules:
 * - Reject unknown keys (including budget)
 * - Name <= 100, reject control characters & newlines
 * - Email <= 150, reject whitespace and , ; < > " '
 * - ProjectType in whitelist
 * - Message 10 to 1000 chars, reject control characters
 */
export function validateContactPayload(body: unknown): ValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { success: false, error: "Invalid request body." };
  }

  const payload = body as Record<string, unknown>;
  const allowedKeys = new Set(["name", "email", "phone", "projectType", "message", "contact_lead_ref"]);
  const submittedKeys = Object.keys(payload);

  for (const key of submittedKeys) {
    if (!allowedKeys.has(key)) {
      return { success: false, error: `Unknown field: ${key}` };
    }
  }

  // 1. Name validation
  const rawName = payload.name;
  if (typeof rawName !== "string") {
    return { success: false, error: "Name is required." };
  }
  const name = rawName.trim();
  if (name.length === 0 || name.length > 100) {
    return { success: false, error: "Name must be between 1 and 100 characters." };
  }
  // Reject control characters and newlines (\x00-\x1F, \x7F)
  if (/[\x00-\x1F\x7F]/.test(name)) {
    return { success: false, error: "Name contains invalid control characters or newlines." };
  }

  // 2. Email validation
  const rawEmail = payload.email;
  if (typeof rawEmail !== "string") {
    return { success: false, error: "Email is required." };
  }
  const email = rawEmail.trim();
  if (email.length < 3 || email.length > 150) {
    return { success: false, error: "Email must be between 3 and 150 characters." };
  }
  // Reject whitespace and characters , ; < > " '
  if (/[\s,;<>"']/.test(email)) {
    return { success: false, error: "Email contains invalid characters or delimiters." };
  }
  // Standard email format verification
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailPattern.test(email)) {
    return { success: false, error: "Invalid email address format." };
  }

  // 3. Phone validation (optional)
  let phone: string | undefined = undefined;
  if ("phone" in payload && payload.phone !== undefined && payload.phone !== null) {
    if (typeof payload.phone !== "string") {
      return { success: false, error: "Phone number must be a string." };
    }
    const trimmedPhone = payload.phone.trim();
    if (trimmedPhone.length > 0) {
      if (trimmedPhone.length < 7 || trimmedPhone.length > 25) {
        return { success: false, error: "Phone number must be between 7 and 25 characters." };
      }
      if (/[\x00-\x1F\x7F]/.test(trimmedPhone)) {
        return { success: false, error: "Phone number contains invalid control characters or newlines." };
      }
      if (!/^[+]?[0-9\s\-()]{7,25}$/.test(trimmedPhone)) {
        return { success: false, error: "Please enter a valid phone number (digits, spaces, +, -, parentheses)." };
      }
      phone = trimmedPhone;
    }
  }

  // 3. Project type validation
  const rawType = payload.projectType;
  if (typeof rawType !== "string" || !ALLOWED_PROJECT_TYPES.includes(rawType as AllowedProjectType)) {
    return { success: false, error: "Please select a valid project type from the list." };
  }
  const projectType = rawType as AllowedProjectType;

  // 4. Message validation
  const rawMessage = payload.message;
  if (typeof rawMessage !== "string") {
    return { success: false, error: "Message is required." };
  }
  const message = rawMessage.trim();
  if (message.length < 10 || message.length > MAX_MESSAGE_LENGTH) {
    return {
      success: false,
      error: `Message must be between 10 and ${MAX_MESSAGE_LENGTH} characters.`,
    };
  }
  // Allow \r\n and \n in message body, but reject other control characters
  if (/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/.test(message)) {
    return { success: false, error: "Message contains invalid control characters." };
  }

  return {
    success: true,
    data: {
      name,
      email,
      phone,
      projectType,
      message,
    },
  };
}

/**
 * Dispatches the contact inquiry to Resend using native fetch.
 * Returns { success: true } or { success: false, error: string }
 */
export async function sendContactEmail(input: ValidatedContactInput): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_EMAIL;
  const sender = process.env.CONTACT_FROM || "onboarding@resend.dev";

  if (!apiKey || !recipient) {
    console.error("Missing required email configuration: RESEND_API_KEY or CONTACT_EMAIL is unset.");
    return { success: false, error: "Contact service is temporarily unavailable." };
  }

  // Subject is sanitized to a single line without newlines
  const subject = `[Project Inquiry] ${input.projectType} - ${input.name}`;

  const plainTextBody = [
    "New project inquiry received from portfolio contact form:",
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Mobile / Phone: ${input.phone || "Not provided"}`,
    `Project Type: ${input.projectType}`,
    "",
    "Message:",
    input.message,
    "",
    "---",
    `Sent at: ${new Date().toISOString()}`,
  ].join("\n");

  const baseUrl = getResendBaseUrl();

  try {
    const res = await fetch(`${baseUrl}/emails`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: sender,
        to: [recipient],
        reply_to: input.email,
        subject,
        text: plainTextBody,
      }),
    });

    const resData = await res.json().catch(() => ({}));

    if (!res.ok) {
      // Log status code and Resend error type only; never log sensitive message text or PII
      console.error(`[Contact API] Resend API dispatch failed with status: ${res.status}`, resData?.message || resData?.name || "");
      return { success: false, error: "Failed to send message. Please try again later." };
    }

    console.log(`[Contact API] Successfully dispatched to Resend. Message ID: ${resData?.id || "ok"}`);
    return { success: true };
  } catch (err) {
    console.error("Network error during Resend email dispatch:", err instanceof Error ? err.message : "Unknown error");
    return { success: false, error: "Failed to send message due to a network error. Please try again later." };
  }
}
