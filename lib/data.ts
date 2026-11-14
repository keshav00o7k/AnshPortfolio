import {
  AboutConfig,
  ChannelVideo,
  ExperienceItem,
  HeroConfig,
  Project,
  ProofMetric,
  ServiceItem,
  SiteConfig,
  TestimonialItem,
} from "@/types";

export const siteConfig: SiteConfig = {
  name: "Ansh Vaishnav",
  title: "Video editor, short-form and long-form content",
  location: "Jaipur, India",
  email: "anshvaishnav2004@gmail.com",
  driveUrl: "", // Add public portfolio Drive URL when available
  youtubeChannelUrl: "https://youtube.com/@sidequestgaming04",
  instagramUrl: "https://instagram.com/side.quest.gaming",
};

export const heroConfig: HeroConfig = {
  headline: "Retention-focused video editing for YouTube and social media",
  tagline:
    "Pacing, sound design and clean transitions in Adobe Premiere Pro. 30+ long-form videos for a 1.5M+ subscriber channel and 70+ reels for clients.",
  showreelUrl: "/videos/reel-01.mp4",
  isPlaceholder: true,
};

export const navLinks = [
  { label: "Work", href: "/#work" },
  { label: "Side Quest", href: "/#channel" },
  { label: "Services", href: "/#services" },
  { label: "About", href: "/#about" },
  { label: "Contact", href: "/contact" },
];

// Phase A project catalog: 9 reels for Selected Work
const projects: Project[] = [
  {
    id: "reel-01",
    title: "Reel 01",
    category: "reel",
    format: "9:16",
    result: "",
    clientLabel: "",
    showClientName: false,
    videoUrl: "/videos/reel-01.mp4",
    isPlaceholder: false,
  },
  {
    id: "reel-02",
    title: "Reel 02",
    category: "reel",
    format: "9:16",
    result: "",
    clientLabel: "",
    showClientName: false,
    videoUrl: "/videos/reel-02.mp4",
    isPlaceholder: false,
  },
  {
    id: "reel-03",
    title: "Reel 03",
    category: "reel",
    format: "9:16",
    result: "",
    clientLabel: "",
    showClientName: false,
    videoUrl: "/videos/reel-03.mp4",
    isPlaceholder: false,
  },
  {
    id: "reel-04",
    title: "Reel 04",
    category: "reel",
    format: "9:16",
    result: "",
    clientLabel: "",
    showClientName: false,
    videoUrl: "/videos/reel-04.mp4",
    isPlaceholder: false,
  },
  {
    id: "reel-05",
    title: "Reel 05",
    category: "reel",
    format: "9:16",
    result: "",
    clientLabel: "",
    showClientName: false,
    videoUrl: "/videos/reel-05.mp4",
    isPlaceholder: false,
  },
  {
    id: "reel-06",
    title: "Reel 06",
    category: "reel",
    format: "9:16",
    result: "",
    clientLabel: "",
    showClientName: false,
    videoUrl: "/videos/reel-06.mp4",
    isPlaceholder: false,
  },
  {
    id: "reel-07",
    title: "Reel 07",
    category: "reel",
    format: "9:16",
    result: "",
    clientLabel: "",
    showClientName: false,
    videoUrl: "/videos/reel-07.mp4",
    isPlaceholder: false,
  },
  {
    id: "reel-08",
    title: "Reel 08",
    category: "reel",
    format: "9:16",
    result: "",
    clientLabel: "",
    showClientName: false,
    videoUrl: "/videos/reel-08.mp4",
    isPlaceholder: false,
  },
  {
    id: "reel-09",
    title: "Reel 09",
    category: "reel",
    format: "9:16",
    result: "",
    clientLabel: "",
    showClientName: false,
    videoUrl: "/videos/reel-09.mp4",
    isPlaceholder: false,
  },
];

export async function getProjects(): Promise<Project[]> {
  return projects;
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  return projects.find((p) => p.id === id);
}

// Personal YouTube channel edits (Side Quest @sidequestgaming04)
export const channelVideos: ChannelVideo[] = [
  {
    id: "channel-01",
    title: "Top 8 Games That Could Have Been Gaming Legends | Episode 1",
    youtubeId: "cavZT0nrt9Q",
    thumbnailUrl: "https://i.ytimg.com/vi/cavZT0nrt9Q/hqdefault.jpg",
    format: "16:9",
  },
  {
    id: "channel-02",
    title: "Top 8 Open World Games That Are Actually AMAZING 🔥 | Episode 2",
    youtubeId: "_RTXmYCO6G8",
    thumbnailUrl: "https://i.ytimg.com/vi/_RTXmYCO6G8/hqdefault.jpg",
    format: "16:9",
  },
  {
    id: "channel-03",
    title: "99% of Players Quit Here. I Didn’t | Sekiro Part 6",
    youtubeId: "Zx_cYrybjzY",
    thumbnailUrl: "https://i.ytimg.com/vi/Zx_cYrybjzY/hqdefault.jpg",
    format: "16:9",
  },
];

export async function getChannelVideos(): Promise<ChannelVideo[]> {
  return channelVideos;
}

// Verified services from REQUIREMENTS.md §3 with resume-grounded descriptions
export const services: ServiceItem[] = [
  {
    id: "youtube-long-form",
    number: "01",
    title: "YouTube long-form",
    description:
      "Retention-focused editing with pacing, sound design, and clean transitions.",
    hasProofCard: false,
  },
  {
    id: "shorts-reels",
    number: "02",
    title: "Shorts and reels",
    description:
      "Short-form vertical edits focused on pacing, clean cuts, and audience retention.",
    hasProofCard: true,
  },
  {
    id: "ads",
    number: "03",
    title: "Ads",
    description:
      "Commercial and promotional edits with clean cuts, pacing, and sound design.",
    hasProofCard: false,
  },
  {
    id: "wedding",
    number: "04",
    title: "Wedding videos",
    description:
      "Clean cuts, pacing, and sound design for wedding videos.",
    hasProofCard: false,
  },
  {
    id: "short-films",
    number: "05",
    title: "Short films",
    description:
      "Clean cuts, pacing, and sound design for short films.",
    hasProofCard: false,
  },
  {
    id: "events",
    number: "06",
    title: "Events",
    description:
      "Event recap and highlight edits with clean cuts and sound design.",
    hasProofCard: false,
  },
  {
    id: "social-media",
    number: "07",
    title: "Social media content",
    description:
      "Montage and interview-style edits with smooth cuts and consistent pacing.",
    hasProofCard: false,
  },
];

export async function getServices(): Promise<ServiceItem[]> {
  return services;
}

// Proof numbers (static text only, no count-up animation)
export const proofMetrics: ProofMetric[] = [
  {
    value: "30+",
    label: "Long-form videos",
    detail: "For a creator with 1.5M+ subscribers",
  },
  {
    value: "70+",
    label: "Short-form reels",
    detail: "For clients across multiple industries",
  },
  {
    // TODO: Confirm with Ansh if 2+ years is still current
    value: "2+",
    label: "Years experience",
    detail: "Professional video editing in Premiere Pro",
  },
];

export async function getProofMetrics(): Promise<ProofMetric[]> {
  return proofMetrics;
}

// Anonymous experience records (years only, zero client names)
export const experiences: ExperienceItem[] = [
  {
    id: "exp-01",
    clientType: "Creator with 1.5M+ subscribers",
    period: "2024–2025",
    description:
      "Edited 30+ long-form YouTube videos focused on pacing, sound design, and clean transitions to maximize audience retention.",
  },
  {
    id: "exp-02",
    clientType: "Marketing agency (freelance)",
    period: "2023–2024",
    description:
      "Edited 70+ short-form reels for multiple clients across various industries; reviewed junior editors' work.",
  },
  {
    id: "exp-03",
    clientType: "Healthcare clinic",
    period: "2023–2024",
    description:
      "Produced 3–4 videos per week featuring montage reels and interview-style edits.",
  },
  {
    id: "exp-04",
    clientType: "Travel agency",
    period: "2022–2023",
    description:
      "Created and edited one travel reel per day aligned with trending topics and formats.",
  },
  {
    id: "exp-05",
    clientType: "Creator",
    period: "2025–Present",
    description:
      "Editing short-form and long-form videos with clean cuts and smooth transitions to maintain viewer engagement.",
  },
];

export async function getExperiences(): Promise<ExperienceItem[]> {
  return experiences;
}

export const aboutConfig: AboutConfig = {
  bio: "With 2+ years of professional editing experience, I help creators and brands produce videos that capture attention and maximize audience retention. My work in Adobe Premiere Pro focuses on clean cuts, pacing, and sound design across long-form YouTube videos and short-form reels. I have delivered over 30 long-form videos for a 1.5M+ subscriber creator and 70+ short-form reels for clients across industries while consistently meeting tight deadlines.",
  toolBadge: "Adobe Premiere Pro (Advanced)",
  photoUrl: "", // Empty until Ansh provides a confirmed photo
  isPlaceholderPhoto: true,
};

export async function getAboutConfig(): Promise<AboutConfig> {
  return aboutConfig;
}

// Testimonials (TBD: Awaiting confirmed quotes from Ansh's clients)
export const testimonials: TestimonialItem[] = [
  {
    id: "test-01",
    name: "Alex Rivera",
    role: "YouTube Creator (500K+ Subs)",
    quote:
      "Working together completely transformed our audience retention. The pacing is razor-sharp, the audio design brings every scene to life, and videos are consistently delivered ahead of schedule.",
    rating: 5,
    photoUrl: "",
    isPlaceholder: true,
  },
  {
    id: "test-02",
    name: "Sarah Jenkins",
    role: "Brand Marketing Lead",
    quote:
      "Our short-form reels saw a marked jump in completion rate within the first month. Incredible attention to detail on hooks, clean cuts, and sound effects that make our content stand out.",
    rating: 5,
    photoUrl: "",
    isPlaceholder: true,
  },
  {
    id: "test-03",
    name: "David Kumar",
    role: "Podcast Producer",
    quote:
      "Fast turnarounds without sacrificing quality. From multi-cam cuts to punchy social clips, every edit is polished and ready to publish. One of the most reliable editors we have worked with.",
    rating: 5,
    photoUrl: "",
    isPlaceholder: true,
  },
];

export async function getTestimonials(): Promise<TestimonialItem[]> {
  return testimonials;
}
