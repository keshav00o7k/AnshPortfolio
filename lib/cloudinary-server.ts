import "server-only";
import crypto from "crypto";
import { CLOUDINARY_FOLDER } from "./cloudinary";
import { verifyAdminSession } from "./admin-auth";
import { ProjectCategory } from "@/types";

export { getPublishedPortfolioVideos } from "./cloudinary-public";

export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100 MB Cloudinary free tier limit
export const ALLOWED_FORMATS = ["mp4", "mov", "webm", "m4v"];

/**
 * Public ID regex pattern:
 * Accepts either:
 * 1. Standard Stage 3+ random identifiers: reel-<12_hex> (e.g. reel-5599100a08d1)
 * 2. Pre-existing legacy portfolio identifiers: reel-<2_digits>_<alphanumeric> (e.g. reel-07_cymp0e)
 * Strictly forbids slashes, backslashes, dots, spaces, or query characters to prevent path traversal.
 */
export const PUBLIC_ID_REGEX = /^reel-([a-f0-9]{12}|[0-9]{2}_[a-zA-Z0-9]+)$/;

export const ALLOWED_CATEGORIES: ProjectCategory[] = [
  "reel",
  "youtube",
  "ad",
  "wedding",
  "film",
  "event",
];

/**
 * Strips Cloudinary context delimiters ('|' and '='), control characters, trims, and caps length.
 * Prevents metadata delimiter injection.
 */
export function sanitizeContextString(input: string, maxLength: number = 80): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[|=]/g, "")
    .replace(/[\x00-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Validates and clamps order value between 0 and 9999.
 */
export function sanitizeOrder(order: unknown): number {
  const parsed = parseInt(String(order), 10);
  if (isNaN(parsed) || parsed < 0) return 0;
  if (parsed > 9999) return 9999;
  return parsed;
}

function getCloudinaryCredentials() {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "";
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim() || "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim() || "";

  return { cloudName, apiKey, apiSecret };
}

export interface CloudinaryAdminResource {
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

export interface UploadSignaturePayload {
  signature: string;
  timestamp: number;
  api_key: string;
  cloud_name: string;
  public_id: string;
  asset_folder: string;
}

/**
 * Generates server-signed parameters for a direct-to-Cloudinary video upload.
 * Enforces admin session check internally.
 * Generates neutral, unguessable public IDs: reel-<12_hex>.
 * NEVER signs or accepts parameters provided by the client.
 */
export async function generateUploadSignature(): Promise<UploadSignaturePayload> {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    throw new Error("Unauthorized: Admin session required.");
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured on server.");
  }

  const randomSuffix = crypto.randomBytes(6).toString("hex");
  const publicId = `reel-${randomSuffix}`;
  const timestamp = Math.floor(Date.now() / 1000);

  const paramsToSign: Record<string, string | number> = {
    asset_folder: CLOUDINARY_FOLDER,
    public_id: publicId,
    timestamp,
  };

  const stringToSign =
    Object.keys(paramsToSign)
      .sort()
      .map((k) => `${k}=${paramsToSign[k]}`)
      .join("&") + apiSecret;

  const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

  return {
    signature,
    timestamp,
    api_key: apiKey,
    cloud_name: cloudName,
    public_id: publicId,
    asset_folder: CLOUDINARY_FOLDER,
  };
}

/**
 * Post-upload verification through the Cloudinary Admin API.
 * Confirms public_id format, asset_folder equals CLOUDINARY_FOLDER,
 * size <= 100MB, allowed format, and draft state (no "publish" tag).
 * If any check fails, immediately deletes the bad asset from Cloudinary.
 */
export async function verifyUploadedResource(publicId: string): Promise<CloudinaryAdminResource> {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    throw new Error("Unauthorized: Admin session required.");
  }

  if (!PUBLIC_ID_REGEX.test(publicId)) {
    throw new Error("Invalid public ID format.");
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials not configured.");
  }

  const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/video/upload/${publicId}?tags=true&context=true`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cloudinary resource lookup failed (${response.status}): ${err}`);
  }

  const resource = (await response.json()) as CloudinaryAdminResource;

  const isValidFolder = resource.asset_folder === CLOUDINARY_FOLDER;
  const isValidType = resource.resource_type === "video";
  const isValidSize = typeof resource.bytes === "number" && resource.bytes <= MAX_VIDEO_BYTES;
  const isValidFormat = ALLOWED_FORMATS.includes(resource.format?.toLowerCase());
  const isDraftOnly = !resource.tags?.includes("publish");

  if (!isValidFolder || !isValidType || !isValidSize || !isValidFormat || !isDraftOnly) {
    console.warn(
      `Resource validation failed for ${publicId}. Purging asset from Cloudinary:`,
      { isValidFolder, isValidType, isValidSize, isValidFormat, isDraftOnly }
    );
    await deleteCloudinaryVideo(publicId).catch(() => {});
    throw new Error("Uploaded asset failed verification requirements and was removed.");
  }

  return resource;
}

/**
 * Updates video metadata (title, category, order) and published state in Cloudinary.
 * Never trusts the client ID: re-verifies ownership and rules via Admin API before acting.
 * Before adding the "publish" tag, re-checks that the asset is a video in CLOUDINARY_FOLDER,
 * within 100 MB and an allowed format.
 */
export async function updatePortfolioVideo(params: {
  publicId: string;
  published?: boolean;
  title?: string;
  category?: string;
  order?: number;
}): Promise<CloudinaryAdminResource> {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    throw new Error("Unauthorized: Admin session required.");
  }

  const { publicId, published, title, category, order } = params;

  if (!PUBLIC_ID_REGEX.test(publicId)) {
    throw new Error("Invalid public ID format.");
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials not configured.");
  }

  const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  // 1. Re-verify asset ownership and current state from Admin API
  const getEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/video/upload/${publicId}?tags=true&context=true`;
  const getRes = await fetch(getEndpoint, {
    method: "GET",
    headers: { Authorization: `Basic ${basicAuth}` },
    cache: "no-store",
  });

  if (!getRes.ok) {
    throw new Error(`Resource lookup failed (${getRes.status})`);
  }

  const currentAsset = (await getRes.json()) as CloudinaryAdminResource;

  if (currentAsset.asset_folder !== CLOUDINARY_FOLDER || currentAsset.resource_type !== "video") {
    throw new Error("Forbidden: Asset does not belong to portfolio folder.");
  }

  // 2. Pre-publish verification checks
  if (published === true) {
    const isValidSize = typeof currentAsset.bytes === "number" && currentAsset.bytes <= MAX_VIDEO_BYTES;
    const isValidFormat = ALLOWED_FORMATS.includes(currentAsset.format?.toLowerCase());
    if (!isValidSize || !isValidFormat) {
      throw new Error("Cannot publish: Asset exceeds 100 MB or is not an allowed video format.");
    }
  }

  // 3. Compute updated tags
  const currentTags = new Set(currentAsset.tags || []);
  if (published !== undefined) {
    if (published) {
      currentTags.add("publish");
    } else {
      currentTags.delete("publish");
    }
  }

  // 4. Compute and sanitize context (title, category, order)
  const currentCtx =
    currentAsset.context?.custom || (currentAsset.context as Record<string, string>) || {};

  const cleanTitle =
    title !== undefined ? sanitizeContextString(title, 80) : sanitizeContextString(currentCtx.title || "", 80);

  let cleanCategory: ProjectCategory = "reel";
  if (category !== undefined) {
    if (ALLOWED_CATEGORIES.includes(category as ProjectCategory)) {
      cleanCategory = category as ProjectCategory;
    }
  } else if (ALLOWED_CATEGORIES.includes(currentCtx.category as ProjectCategory)) {
    cleanCategory = currentCtx.category as ProjectCategory;
  }

  const cleanOrder =
    order !== undefined ? sanitizeOrder(order) : sanitizeOrder(currentCtx.order || 0);

  // Cloudinary context key-value serialization: key=val|key2=val2
  const contextSerialized = `title=${cleanTitle}|category=${cleanCategory}|order=${cleanOrder}`;

  // 5. Apply updates via Cloudinary Admin API
  const updateEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/video/upload/${publicId}`;
  const formData = new URLSearchParams();
  formData.append("tags", Array.from(currentTags).join(","));
  formData.append("context", contextSerialized);

  const updateRes = await fetch(updateEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  if (!updateRes.ok) {
    const err = await updateRes.text();
    throw new Error(`Cloudinary update failed (${updateRes.status}): ${err}`);
  }

  return (await updateRes.json()) as CloudinaryAdminResource;
}

/**
 * Deletes a video asset from Cloudinary storage.
 * Enforces admin session check and verifies asset ownership before deletion.
 */
export async function deleteCloudinaryVideo(publicId: string): Promise<void> {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    throw new Error("Unauthorized: Admin session required.");
  }

  if (!PUBLIC_ID_REGEX.test(publicId)) {
    throw new Error("Invalid public ID format.");
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials not configured.");
  }

  const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  // 1. Verify existence and folder ownership before deletion
  const getEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/video/upload/${publicId}`;
  const getRes = await fetch(getEndpoint, {
    method: "GET",
    headers: { Authorization: `Basic ${basicAuth}` },
    cache: "no-store",
  });

  if (!getRes.ok) {
    throw new Error(`Cannot delete: Asset lookup failed (${getRes.status}).`);
  }

  const asset = (await getRes.json()) as CloudinaryAdminResource;
  if (asset.asset_folder !== CLOUDINARY_FOLDER || asset.resource_type !== "video") {
    throw new Error("Forbidden: Asset does not belong to portfolio folder.");
  }

  // 2. Perform deletion
  const deleteEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/video/upload?public_ids[]=${publicId}&invalidate=true`;
  const deleteRes = await fetch(deleteEndpoint, {
    method: "DELETE",
    headers: {
      Authorization: `Basic ${basicAuth}`,
    },
  });

  if (!deleteRes.ok) {
    const err = await deleteRes.text();
    throw new Error(`Failed to delete resource (${deleteRes.status}): ${err}`);
  }
}

/**
 * Fetches all portfolio videos (both published and draft) for the admin dashboard.
 * Enforces admin session verification inside the function.
 */
export async function getAdminPortfolioVideos(): Promise<CloudinaryAdminResource[]> {
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    throw new Error("Unauthorized: Admin session required.");
  }

  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary credentials are not configured.");
  }

  const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expression: `asset_folder="${CLOUDINARY_FOLDER}" AND resource_type=video`,
      with_field: ["tags", "context"],
      sort_by: [{ created_at: "desc" }],
      max_results: 100,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Cloudinary Admin Search error (${response.status}): ${err}`);
  }

  const data = await response.json();
  return data.resources || [];
}
