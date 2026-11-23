export type ProjectCategory =
  | "youtube"
  | "reel"
  | "ad"
  | "wedding"
  | "film"
  | "event";

export type ProjectFormat = "16:9" | "9:16";

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  format: ProjectFormat;
  result: string;
  clientLabel: string;
  clientName?: string;
  showClientName: boolean;
  cloudinaryPublicId?: string;
  localFile?: string;
  videoUrl: string;
  fullVideoUrl?: string;
  posterUrl?: string;
  youtubeId?: string;
  isPlaceholder: boolean;
  order?: number;
}

export interface HeroConfig {
  headline: string;
  tagline: string;
  showreelUrl?: string;
  posterUrl?: string;
  isPlaceholder: boolean;
}

export interface SiteConfig {
  name: string;
  title: string;
  location: string;
  email: string;
  driveUrl: string;
  youtubeChannelUrl: string;
  instagramUrl: string;
}

export interface ServiceItem {
  id: string;
  number: string;
  title: string;
  description: string;
  hasProofCard: boolean;
}

export interface ProofMetric {
  value: string;
  label: string;
  detail: string;
}

export interface ExperienceItem {
  id: string;
  clientType: string;
  period: string;
  description: string;
}

export interface AboutConfig {
  bio: string;
  toolBadge: string;
  photoUrl?: string;
  isPlaceholderPhoto: boolean;
}

export interface ChannelVideo {
  id: string;
  title: string;
  youtubeId: string;
  thumbnailUrl: string;
  format: "16:9";
}

export interface ModalVideoItem {
  id: string;
  title: string;
  format: ProjectFormat;
  videoUrl?: string;
  fullVideoUrl?: string;
  youtubeId?: string;
}

export interface AdminVideoItem {
  publicId: string;
  title: string;
  category: ProjectCategory;
  order: number;
  isPublished: boolean;
  assetFolder: string;
  bytes: number;
  format: string;
  duration?: number;
  createdAt: string;
  previewUrl: string;
  fullVideoUrl: string;
  posterUrl: string;
}

export type ContactProjectType =
  | "YouTube long-form"
  | "Shorts and reels"
  | "Ads"
  | "Wedding"
  | "Short film"
  | "Event"
  | "Social media"
  | "Other";

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  projectType: ContactProjectType | string;
  message: string;
  contact_lead_ref?: string;
}

export interface LeadSubmission {
  name: string;
  email: string;
  projectType: ProjectCategory | "other";
  budget: string;
  message: string;
  createdAt: Date;
}

export interface TestimonialItem {
  id: string;
  quote: string;
  name: string;
  role: string;
  rating: number;
  photoUrl?: string;
  isPlaceholder: boolean;
}
