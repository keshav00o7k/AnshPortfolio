import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";
import { getAdminPortfolioVideos } from "@/lib/cloudinary-server";
import {
  getReelPreviewUrl,
  getReelFullUrl,
  getReelPosterUrl,
} from "@/lib/cloudinary";
import { AdminVideoItem, ProjectCategory } from "@/types";

export async function GET() {
  // 1. Session check inside route
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    return NextResponse.json(
      { error: "Unauthorized: Admin session required." },
      { status: 401 }
    );
  }

  // 2. Fetch all portfolio videos in folder (drafts and published)
  try {
    const rawResources = await getAdminPortfolioVideos();

    const assets: AdminVideoItem[] = rawResources.map((res) => {
      const customCtx =
        res.context?.custom || (res.context as Record<string, string>) || {};
      const title = customCtx.title || res.filename || res.public_id;
      const category = (customCtx.category || "reel") as ProjectCategory;
      const order = parseInt(customCtx.order || "0", 10) || 0;
      const isPublished = Boolean(res.tags?.includes("publish"));

      return {
        publicId: res.public_id,
        title,
        category,
        order,
        isPublished,
        assetFolder: res.asset_folder || "",
        bytes: res.bytes || 0,
        format: res.format || "mp4",
        createdAt: res.created_at,
        previewUrl: getReelPreviewUrl(res.public_id),
        fullVideoUrl: getReelFullUrl(res.public_id),
        posterUrl: getReelPosterUrl(res.public_id) || "",
      };
    });

    return NextResponse.json({ assets });
  } catch (err) {
    console.error(
      "Admin list query error:",
      err instanceof Error ? err.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to retrieve portfolio video list." },
      { status: 500 }
    );
  }
}
