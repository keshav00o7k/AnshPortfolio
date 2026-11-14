import React from "react";
import { PlaceholderBadge } from "@/components/ui/PlaceholderBadge";

interface PhotoPlaceholderProps {
  photoUrl?: string;
  isPlaceholder?: boolean;
}

export const PhotoPlaceholder: React.FC<PhotoPlaceholderProps> = ({
  photoUrl,
  isPlaceholder = true,
}) => {
  const isDev = process.env.NODE_ENV === "development";
  const hasPhoto = Boolean(photoUrl && photoUrl.trim() !== "");

  // In production, hide photo block until a confirmed photo path is set
  if (!isDev && !hasPhoto) {
    return null;
  }

  return (
    <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-[28px] overflow-hidden bg-surface border border-line shadow-lg flex items-center justify-center flex-shrink-0">
      {hasPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element -- Local/remote portfolio photo
        <img
          src={photoUrl}
          alt="Ansh Vaishnav"
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-surface to-bg text-center">
          {/* Subtle avatar silhouette */}
          <div className="w-16 h-16 rounded-full bg-line flex items-center justify-center text-mute mb-3">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>

          <span className="text-xs text-mute font-medium">Profile Photo</span>
        </div>
      )}
    </div>
  );
};

