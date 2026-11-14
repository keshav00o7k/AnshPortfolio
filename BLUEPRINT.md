# BLUEPRINT.md: Ansh Vaishnav Video Editor Portfolio Architecture

> **Reference Documents:** [REQUIREMENTS.md](file:///c:/Users/INDIA/Desktop/anshPortfolio/REQUIREMENTS%20(2).md) | [DESIGN.md](file:///c:/Users/INDIA/Desktop/anshPortfolio/DESIGN.md) | [RULES.md](file:///c:/Users/INDIA/Desktop/anshPortfolio/RULES.md) | [ASSETS.md](file:///c:/Users/INDIA/Desktop/anshPortfolio/ASSETS.md)
>
> **Core Principle:** The videos are the hero, the UI is the frame.

---

## 🏗️ Phased Delivery Strategy

* **PHASE A (Active — Current Build)**: Simple, clean, fully responsive, professional site.
  * **Sections**: Nav, Hero (clean framed showreel), Client work (dynamic filters + format-adaptive grid + video modal), My channel, Services, About, Contact (MongoDB lead capture), Footer.
  * **Video Serving in Phase A**: Original videos served directly from `public/videos/` (frontend only, no compression step). `public/videos/` is strictly added to `.gitignore`.
  * **Data Layer Abstraction**: UI components never hard-code video paths. All project media queries go through `async getProjects()` in `lib/data.ts` to allow seamless swap to MongoDB + Cloudinary later without touching components.
  * **Video Playback Rules**: `preload="none"` or `"metadata"`. Plays only on hover (desktop) or in-view (mobile). **Only one video plays at a time** (managed active video state); pauses when off-screen. Full video loads only in the modal.
  * **Allowed Animations in Phase A**: Only simple section fade/slide-up on scroll (`motion`), button hover, and modal open/close. **Nothing else.**
* **PHASE B (Deferred — Do Not Build)**: Interactive/WebGL enhancements to be added later only when explicitly instructed.
  * Timeline scrub on hero *(deferred, do not build)*
  * WebGL hover displacement / shader ripple *(deferred, do not build)*
  * GSAP pinned horizontal gallery *(deferred, do not build)*
  * Custom magnetic cursor *(deferred, do not build)*
  * Cut-style page transitions *(deferred, do not build)*
  * Lenis smooth scroll *(deferred, do not build)*

---

## 1. Sitemap (Section Order & Purpose — Phase A)

All text follows sentence case per `DESIGN.md`.

| Order | Section ID | Name | Core Purpose | Status |
|---|---|---|---|---|
| 0 | `#nav` | **Navigation** | Fixed top header providing instant orientation, name ("Ansh Vaishnav"), anchor links, and direct contact CTA. Translucent blur. | **Phase A (Active)** |
| 1 | `#hero` | **Hero** | Clean framed muted autoplaying showreel, one-line positioning statement ("Video editor specializing in short-form and long-form content"), CTA button ("See my work"). No timeline scrub. | **Phase A (Active)** |
| 2 | `#work` | **Client work** | Filterable media grid categorised by format (16:9 for YouTube long-form, 9:16 for Reels and Shorts). Cards autoplay muted previews on hover/in-view (single active video); clicking opens a modal player with sound. Includes a "More samples" button linking to Google Drive (`driveUrl`). | **Phase A (Active)** |
| — | `#featured-gallery` | **Featured gallery** | Pinned horizontal scroll section for desktop. | **Phase B (Deferred, do not build)** |
| 3 | `#channel` | **My channel** | Shows consistency and personal editing style via Ansh's personal gaming channel (`@sidequestgaming04` on YouTube and Instagram). Clearly separated from commercial client work. | **Phase A (Active)** |
| 4 | `#services` | **Services** | Displays the 7 verified editing services from `REQUIREMENTS.md §3` with clean hover states. | **Phase A (Active)** |
| 5 | `#about` | **About** | Short bio, 3 verifiable resume proof points (30+ long videos, 70+ reels, 2+ years), and primary tool badge (Adobe Premiere Pro). | **Phase A (Active)** |
| 6 | `#contact` | **Contact** | Form (Name, Email, Project type, Budget, Message) saving to MongoDB, plus email and social links (Instagram and YouTube). No phone number displayed. | **Phase A (Active)** |
| 7 | `#footer` | **Footer** | Copyright notice ("© Ansh Vaishnav") and back-to-top link. | **Phase A (Active)** |

---

## 2. Data Map & Schema (`lib/data.ts`)

All project data is abstracted behind `async getProjects()`. Adding, modifying, or changing storage backends requires zero changes to UI components.

### Data Types (`types/index.ts`)
```ts
export type ProjectCategory = "youtube" | "reel" | "ad" | "wedding" | "film" | "event";

export type ProjectFormat = "16:9" | "9:16";

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  format: ProjectFormat;
  result: string;                // Accurate factual outcome without claiming channel growth
  clientLabel: string;          // Anonymous label (e.g. "1.5M+ subscriber YouTube creator")
  clientName?: string;          // Optional real client name
  showClientName: boolean;      // Default: false (enforces anonymity until confirmed)
  videoUrl: string;             // Path in public/videos/ or remote URL
  posterUrl?: string;           // Optional; if omitted, use `${videoUrl}#t=0.1` for first frame
  youtubeId?: string;           // Embed ID for full-player modal (youtube-nocookie.com)
  isPlaceholder: boolean;       // True if using placeholder media; displays visible "Placeholder" tag
}

export interface HeroConfig {
  headline: string;
  tagline: string;
  showreelUrl: string;
  posterUrl?: string;
  isPlaceholder: boolean;       // Displays visible "Placeholder" tag if true
}

export interface SiteConfig {
  name: string;
  title: string;
  location: string;
  email: string;
  driveUrl: string;             // Google Drive link for "More samples" button
  youtubeChannelUrl: string;
  instagramUrl: string;
}

export interface ServiceItem {
  id: string;
  number: string;               // e.g. "01", "02"
  title: string;
  description: string;
  hasProofCard: boolean;        // True if verified project samples exist in Client work
}

export interface ProofMetric {
  value: string;                // "30+", "70+", "2+"
  label: string;                // "Long-form videos", "Short-form reels", "Years experience"
  detail: string;               // Factual description (e.g. "For a 1.5M+ subscriber creator")
}

export interface LeadSubmission {
  name: string;
  email: string;
  projectType: ProjectCategory | "other";
  budget: string;
  message: string;
  createdAt: Date;
}
```

### Data Access Abstraction (`lib/data.ts`)
```ts
// Components call this function exclusively:
export async function getProjects(): Promise<Project[]> {
  // Phase A: returns local data mapping to public/videos/ and YouTube embeds
  // Phase B / Future: can seamlessly fetch from MongoDB / Cloudinary
  return projects;
}

export async function getProjectById(id: string): Promise<Project | undefined> {
  return projects.find((p) => p.id === id);
}
```

---

## 3. Visual Layout, Playback Controller & Motion System

### Playback Rules for Grid Cards
1. **Preload**: Set to `preload="none"` (or `preload="metadata"`).
2. **Single Active Video**: Only ONE video is allowed to play at any given time across the entire page. A global/context state or parent controller coordinates `activeVideoId`. When card B starts playing, card A immediately pauses and resets.
3. **Trigger**: Hover triggers playback on desktop; mobile triggers playback when element is centered in viewport via `IntersectionObserver`.
4. **Off-screen Pause**: Any video scrolling out of view pauses automatically.
5. **Modal Isolation**: Full video (with unmuted audio) loads only on click inside the modal player.

### Phase A Motion Rules
* **Allowed**: Simple section fade/slide-up on scroll (`motion` `whileInView={{ opacity: 1, y: 0 }}`), button hover transitions, and modal open/close opacity/scale.
* **Prohibited in Phase A**: No WebGL, no custom cursor, no GSAP horizontal pinning, no timeline scrubbing, no Lenis smooth scroll. Native browser scrolling only.

---

## 4. Component Tree (Phase A Build — File Names Only)

```text
anshPortfolio/
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── robots.ts
│   ├── sitemap.ts
│   └── api/
│       └── contact/
│           └── route.ts
├── components/
│   ├── nav/
│   │   ├── Navbar.tsx
│   │   └── MobileMenu.tsx
│   ├── hero/
│   │   ├── Hero.tsx
│   │   └── ShowreelPlayer.tsx
│   ├── work/
│   │   ├── WorkSection.tsx
│   │   ├── FilterTabs.tsx
│   │   ├── WorkGrid.tsx
│   │   ├── ProjectCard.tsx
│   │   └── VideoModal.tsx
│   ├── channel/
│   │   ├── ChannelSection.tsx
│   │   └── ChannelCard.tsx
│   ├── services/
│   │   ├── ServicesSection.tsx
│   │   └── ServiceRow.tsx
│   ├── about/
│   │   ├── AboutSection.tsx
│   │   ├── ProofMetrics.tsx
│   │   └── ToolBadge.tsx
│   ├── contact/
│   │   ├── ContactSection.tsx
│   │   ├── ContactForm.tsx
│   │   └── SocialLinks.tsx
│   ├── footer/
│   │   └── Footer.tsx
│   └── ui/
│       ├── Button.tsx
│       └── PlaceholderBadge.tsx
├── lib/
│   ├── data.ts
│   └── mongodb.ts
├── models/
│   └── Lead.ts
└── types/
    └── index.ts
```

---

## 5. Mobile vs. Desktop Matrix (Phase A)

| Feature / Behavior | Mobile (< 768px) | Desktop (>= 1024px) |
|---|---|---|
| **Navigation** | Sticky bar with logo and hamburger toggle opening a fullscreen/sheet drawer. | Floating pill header with backdrop blur, centered links, and CTA button. |
| **Padding & Spacing** | Horizontal padding: `24px`. Section vertical padding: `72px`. | Horizontal padding: `48px`. Section vertical padding: `112px`. |
| **Hero Video** | Inline muted video in frame. Poster fallback. | High-res video in frame. Poster fallback. |
| **Client Work Layout** | 1-column stack. Reels display full 9:16 vertical ratio; YouTube videos display 16:9. | Multi-column mixed-format grid (16:9 spans 2 cols, 9:16 spans 1 col). |
| **Video Playback on Cards** | Autoplays muted when centered in viewport via `IntersectionObserver` (max one active). | Autoplays muted on mouse hover (max one active). |
| **Modal Player** | Fullscreen mobile player with touch-friendly dismiss. | Centered modal with backdrop blur, ESC shortcut, and focus trap. |
| **Scrolling & Animations** | Standard browser native scroll. Simple scroll reveal. | Standard browser native scroll. Simple scroll reveal. |

---

## 6. Placeholders & Inventory Tracking

* All raw videos and YouTube embeds are cataloged in [ASSETS.md](file:///c:/Users/INDIA/Desktop/anshPortfolio/ASSETS.md).
* Categories are marked as `UNCONFIRMED` and `showClientName: false` until Ansh confirms them.
* Filter chips are generated dynamically: only categories containing at least one confirmed/non-placeholder project will display a chip.
