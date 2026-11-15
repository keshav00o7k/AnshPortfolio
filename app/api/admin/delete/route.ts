import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { verifyCsrfOrigin, verifyAdminSession } from "@/lib/admin-auth";
import {
  deleteCloudinaryVideo,
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

  // 2. Session verification inside handler
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized: Admin session required." },
      { status: 401 }
    );
  }

  // 3. Parse and validate body
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON request body." },
      { status: 400 }
    );
  }

  // Reject bulk deletion arrays or unknown keys
  if (Array.isArray(body.public_ids) || Array.isArray(body.public_id)) {
    return NextResponse.json(
      { error: "Bulk deletion is disabled. Assets must be deleted individually." },
      { status: 400 }
    );
  }

  const allowedKeys = new Set(["public_id"]);
  for (const key of Object.keys(body)) {
    if (!allowedKeys.has(key)) {
      return NextResponse.json(
        { error: `Unknown field rejected: '${key}'.` },
        { status: 400 }
      );
    }
  }

  const publicId = typeof body.public_id === "string" ? body.public_id.trim() : "";
  if (!publicId || !PUBLIC_ID_REGEX.test(publicId)) {
    return NextResponse.json(
      { error: "Invalid public_id format." },
      { status: 400 }
    );
  }

  // 4. Delete asset via Cloudinary Admin API
  try {
    await deleteCloudinaryVideo(publicId);

    // 5. Revalidate public cache tags and routes
    try {
      revalidatePath("/", "page");
      revalidatePath("/", "layout");
      revalidateTag("portfolio-videos", "max");
    } catch (revalErr) {
      console.warn("Revalidation notice:", revalErr);
    }

    return NextResponse.json({
      success: true,
      deleted: publicId,
    });
  } catch (err) {
    console.error(
      `Deletion failed for ${publicId}:`,
      err instanceof Error ? err.message : "Unknown error"
    );
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to delete asset from Cloudinary.",
      },
      { status: 400 }
    );
  }
}
