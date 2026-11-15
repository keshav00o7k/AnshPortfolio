import "server-only";

import { Project, ProjectCategory } from "@/types";
import {
  CLOUDINARY_FOLDER,
  getReelPreviewUrl,
  getReelFullUrl,
  getReelPosterUrl,
} from "./cloudinary";

/**
 * Cloudinary API credentials helper for public video queries.
 * Server-side only: never logs or exposes any keys.
 */
function getCloudinaryCredentials(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "";
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim() || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() || "";

  if (process.env.NODE_ENV === "production") {
    if (!cloudName) {
      throw new Error(
        "FATAL: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required in production."
      );
    }
    if (!apiKey || !apiSecret) {
      throw new Error(
        "FATAL: CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET are required in production."
      );
    }
  }

  return { cloudName, apiKey, apiSecret };
}

interface CloudinarySearchResource {
  asset_id: string;
  public_id: string;
  format: string;
  version: number;
  resource_type: string;
  type: string;
  created_at: string;
  bytes: number;
  width?: number;
  height?: number;
  asset_folder?: string;
  filename?: string;
  tags?: string[];
  context?: {
    custom?: Record<string, string>;
    [key: string]: unknown;
  };
}

interface CloudinarySearchResponse {
  total_count: number;
  time: number;
  resources: CloudinarySearchResource[];
  error?: {
    message: string;
  };
}

/**
 * Public read function: Fetches published portfolio videos from Cloudinary Search API.
 * Query: asset_folder="AnshPortfolio" AND tags=publish AND resource_type=video
 * Cached with Next.js ISR: revalidate = 60s, tag = "portfolio-videos".
 * Safe for public pages: requires no admin session.
 */
export async function getPublishedPortfolioVideos(): Promise<Project[]> {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

  if (!cloudName || !apiKey || !apiSecret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: Cloudinary credentials missing in production environment."
      );
    }
    // In development without credentials, return empty array to trigger static fallback
    return [];
  }

  const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        expression: `asset_folder="${CLOUDINARY_FOLDER}" AND tags=publish AND resource_type=video`,
        with_field: ["tags", "context"],
        sort_by: [{ created_at: "desc" }],
        max_results: 100,
      }),
      next: {
        revalidate: 60,
        tags: ["portfolio-videos"],
      },
    });

    if (!response.ok) {
      const errText = await response.text();
      if (process.env.NODE_ENV === "production") {
        throw new Error(
          `Cloudinary Search API error (${response.status}): ${errText}`
        );
      }
      console.warn("Cloudinary Search API non-200 in development:", response.status);
      return [];
    }

    const data = (await response.json()) as CloudinarySearchResponse;

    if (!data.resources || data.resources.length === 0) {
      return [];
    }

    const mappedProjects: Project[] = data.resources.map((res) => {
      const customCtx = res.context?.custom || (res.context as Record<string, string>) || {};
      const title = customCtx.title || res.filename || res.public_id;
      const category = (customCtx.category || "reel") as ProjectCategory;
      const order = parseInt(customCtx.order || "0", 10) || 0;
      const clientLabel = customCtx.clientLabel || "";
      const result = customCtx.result || "";

      return {
        id: res.public_id,
        title,
        category,
        format: "9:16",
        result,
        clientLabel,
        showClientName: false,
        cloudinaryPublicId: res.public_id,
        videoUrl: getReelPreviewUrl(res.public_id),
        fullVideoUrl: getReelFullUrl(res.public_id),
        posterUrl: getReelPosterUrl(res.public_id),
        isPlaceholder: false,
        order,
      };
    });

    const hasCustomOrdering = mappedProjects.some((p) => (p.order || 0) > 0);
    if (hasCustomOrdering) {
      mappedProjects.sort((a, b) => (a.order || 0) - (b.order || 0));
    }

    return mappedProjects;
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    console.warn("Error fetching Cloudinary search resources in dev:", error);
    return [];
  }
}

