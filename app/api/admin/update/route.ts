import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { verifyCsrfOrigin, verifyAdminSession } from "@/lib/admin-auth";
import {
  updatePortfolioVideo,
  PUBLIC_ID_REGEX,
  ALLOWED_CATEGORIES,
} from "@/lib/cloudinary-server";
import { ProjectCategory } from "@/types";

const ALLOWED_UPDATE_FIELDS = new Set([
  "public_id",
  "published",
  "title",
  "category",
  "order",
]);

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

  // Reject unknown fields
  for (const key of Object.keys(body)) {
    if (!ALLOWED_UPDATE_FIELDS.has(key)) {
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

  const published = typeof body.published === "boolean" ? body.published : undefined;
  const title = typeof body.title === "string" ? body.title : undefined;

  let category: ProjectCategory | undefined = undefined;
  if (body.category !== undefined) {
    if (typeof body.category !== "string" || !ALLOWED_CATEGORIES.includes(body.category as ProjectCategory)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${ALLOWED_CATEGORIES.join(", ")}.` },
        { status: 400 }
      );
    }
    category = body.category as ProjectCategory;
  }

  let order: number | undefined = undefined;
  if (body.order !== undefined) {
    const num = Number(body.order);
    if (!Number.isInteger(num) || num < 0 || num > 9999) {
      return NextResponse.json(
        { error: "Order must be an integer between 0 and 9999." },
        { status: 400 }
      );
    }
    order = num;
  }

  // 4. Perform update via Cloudinary Admin API
  try {
    const updated = await updatePortfolioVideo({
      publicId,
      published,
      title,
      category,
      order,
    });

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
      publicId: updated.public_id,
      tags: updated.tags || [],
      context: updated.context || {},
    });
  } catch (err) {
    console.error(
      `Update failed for ${publicId}:`,
      err instanceof Error ? err.message : "Unknown error"
    );
    return NextResponse.json(
      {
        error:
          err instanceof Error
            ? err.message
            : "Failed to update asset in Cloudinary.",
      },
      { status: 400 }
    );
  }
}
