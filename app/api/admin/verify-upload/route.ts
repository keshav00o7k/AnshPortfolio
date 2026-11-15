import { NextRequest, NextResponse } from "next/server";
import { verifyCsrfOrigin, verifyAdminSession } from "@/lib/admin-auth";
import {
  verifyUploadedResource,
  PUBLIC_ID_REGEX,
} from "@/lib/cloudinary-server";

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

  // 3. Parse and validate body
  let publicId = "";
  try {
    const body = await request.json();
    if (body && typeof body.public_id === "string") {
      publicId = body.public_id.trim();
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  if (!publicId || !PUBLIC_ID_REGEX.test(publicId)) {
    return NextResponse.json(
      { error: "Invalid public_id. Format must match reel-<12_hex>." },
      { status: 400 }
    );
  }

  // 4. Verify through Admin API
  try {
    const verified = await verifyUploadedResource(publicId);
    return NextResponse.json({
      success: true,
      publicId: verified.public_id,
      bytes: verified.bytes,
      format: verified.format,
      assetFolder: verified.asset_folder,
    });
  } catch (err) {
    console.error(
      "Verification failed for uploaded asset:",
      err instanceof Error ? err.message : "Unknown error"
    );
    return NextResponse.json(
      {
        error:
          "Verification failed: Asset does not satisfy folder, type, size, or draft constraints.",
      },
      { status: 400 }
    );
  }
}
