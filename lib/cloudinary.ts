/**
 * Client and server Cloudinary URL generation helper.
 * Zero secrets: only consumes process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME.
 * Enforces c_limit to prevent upscaling 720p source files.
 */

export const CLOUDINARY_FOLDER = "AnshPortfolio";

export function getCloudinaryCloudName(): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName || cloudName.trim() === "") {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is not defined. Production deployments require Cloudinary hosting."
      );
    }
    return "";
  }
  return cloudName.trim();
}

/**
 * Variant 1: Card preview video (short, silent, 480px limit, auto quality and format).
 * Parameters: f_auto,q_auto,c_limit,w_480,du_4,ac_none
 */
export function getReelPreviewUrl(publicId?: string, localFallback: string = ""): string {
  const cloudName = getCloudinaryCloudName();
  if (!cloudName || !publicId) {
    return localFallback;
  }
  return `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto,c_limit,w_480,du_4,ac_none/${publicId}.mp4`;
}

/**
 * Variant 2: Full modal video (1080px limit, auto quality and format, audio intact).
 * Parameters: f_auto,q_auto,c_limit,w_1080
 */
export function getReelFullUrl(publicId?: string, localFallback: string = ""): string {
  const cloudName = getCloudinaryCloudName();
  if (!cloudName || !publicId) {
    return localFallback;
  }
  return `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto,c_limit,w_1080/${publicId}.mp4`;
}

/**
 * Variant 3: Poster frame extracted from second 0 (image/jpeg).
 * Parameters: so_0,f_auto,q_auto,c_limit,w_480
 */
export function getReelPosterUrl(publicId?: string): string | undefined {
  const cloudName = getCloudinaryCloudName();
  if (!cloudName || !publicId) {
    return undefined;
  }
  return `https://res.cloudinary.com/${cloudName}/video/upload/so_0,f_auto,q_auto,c_limit,w_480/${publicId}.jpg`;
}

/**
 * Responsive image delivery URL.
 */
export function getCloudinaryImageUrl(publicId: string, width: number = 600): string {
  const cloudName = getCloudinaryCloudName();
  if (!cloudName || !publicId) {
    return "";
  }
  return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,c_limit,w_${width}/${publicId}`;
}

