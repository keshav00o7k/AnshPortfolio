import "server-only";

import { Project } from "@/types";
import { getPublishedPortfolioVideos } from "./cloudinary-public";
import { staticProjects } from "./data";

/**
 * Server-only portfolio projects loader.
 * 
 * Production behavior:
 * - Queries published videos from Cloudinary Search API (asset_folder="AnshPortfolio" AND tags=publish).
 * - NEVER falls back to local /videos/ files in production.
 * - If Cloudinary returns 0 published videos in production, returns [] (clean empty state).
 * - If the Cloudinary Search API fails in production, the error propagates so Next.js ISR
 *   preserves and continues serving the last successfully generated page.
 * 
 * Development behavior:
 * - If credentials are not configured or 0 videos are returned, smoothly falls back
 *   to local static reels for offline UI development.
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const publishedVideos = await getPublishedPortfolioVideos();
    if (publishedVideos && publishedVideos.length > 0) {
      return publishedVideos;
    }

    // In production: NEVER fall back to local /videos/
    if (process.env.NODE_ENV === "production") {
      return [];
    }
  } catch (error) {
    // In production: let the error propagate so Next.js ISR serves stale cache
    if (process.env.NODE_ENV === "production") {
      throw error;
    }
    console.warn("Using fallback local projects in development:", error);
  }

  // Development-only fallback
  return staticProjects;
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  const allProjects = await getProjects();
  return allProjects.find((p) => p.id === id);
}

