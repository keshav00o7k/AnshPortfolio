import { NextRequest, NextResponse } from "next/server.js";
import {
  verifyContactOrigin,
  getClientIp,
  checkContactRateLimit,
  validateContactPayload,
  sendContactEmail,
} from "@/lib/contact-server";

export async function POST(request: NextRequest) {
  // Step 1: Origin check (Origin only; missing or mismatched returns 403)
  if (!verifyContactOrigin(request)) {
    return NextResponse.json(
      { error: "Forbidden: Invalid or missing Origin header." },
      { status: 403 }
    );
  }

  // Parse request body safely
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  // Step 2: Honeypot check
  // If the hidden honeypot field is filled, silently return 200 OK without sending an email
  if (
    body &&
    typeof body === "object" &&
    "contact_lead_ref" in body &&
    typeof (body as Record<string, unknown>).contact_lead_ref === "string" &&
    ((body as Record<string, unknown>).contact_lead_ref as string).trim() !== ""
  ) {
    console.warn("[Contact API] Honeypot field was populated; dropping submission silently.");
    return NextResponse.json({ success: true });
  }

  // Step 3: Rate limit check (per client IP)
  const clientIp = getClientIp(request);
  if (!checkContactRateLimit(clientIp)) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a few minutes before trying again." },
      { status: 429 }
    );
  }

  // Step 4: Hand-written payload validation
  const validation = validateContactPayload(body);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }

  // Check required server environment variables
  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
    console.error("Missing required server configuration: RESEND_API_KEY or CONTACT_EMAIL is unset.");
    return NextResponse.json(
      { error: "Contact service is temporarily unavailable." },
      { status: 500 }
    );
  }

  // Step 5: Dispatch email via Resend
  const sendResult = await sendContactEmail(validation.data);
  if (!sendResult.success) {
    return NextResponse.json(
      { error: sendResult.error || "Failed to deliver message." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
