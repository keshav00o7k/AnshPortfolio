import { NextRequest, NextResponse } from "next/server";
import { verifyCsrfOrigin, verifyAdminSession } from "@/lib/admin-auth";
import { generateUploadSignature } from "@/lib/cloudinary-server";

// In-memory sliding-window rate limiter per session
// Allows at most 10 upload signatures per 10 minutes
const signatureTimestampsMap = new Map<string, number[]>();
const MAX_SIGNATURES_PER_WINDOW = 10;
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

function checkUploadRateLimit(sessionToken: string): boolean {
  const now = Date.now();
  const timestamps = signatureTimestampsMap.get(sessionToken) || [];

  // Filter timestamps within current 10-minute sliding window
  const activeTimestamps = timestamps.filter((t) => now - t < WINDOW_MS);

  if (activeTimestamps.length >= MAX_SIGNATURES_PER_WINDOW) {
    signatureTimestampsMap.set(sessionToken, activeTimestamps);
    return false; // Rate limit exceeded
  }

  activeTimestamps.push(now);
  signatureTimestampsMap.set(sessionToken, activeTimestamps);
  return true;
}

export async function POST(request: NextRequest) {
  // 1. Strict CSRF verification
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json(
      { error: "Forbidden: Cross-site request rejected" },
      { status: 403 }
    );
  }

  // 2. Authentication check inside route handler
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized: Admin session required." },
      { status: 401 }
    );
  }

  // 3. Upload signing rate limit check
  const sessionCookie = request.cookies.get("admin_session")?.value || "default";
  if (!checkUploadRateLimit(sessionCookie)) {
    return NextResponse.json(
      {
        error:
          "Upload rate limit exceeded. You can request up to 10 upload signatures per 10 minutes.",
      },
      { status: 429 }
    );
  }

  // 4. Generate server-signed parameters
  try {
    const signedParams = await generateUploadSignature();
    return NextResponse.json(signedParams);
  } catch (err) {
    console.error(
      "Failed to sign upload parameters:",
      err instanceof Error ? err.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Internal server error generating upload signature." },
      { status: 500 }
    );
  }
}
