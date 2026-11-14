# REQUIREMENTS.md: Ansh Vaishnav Video Editor Portfolio

Items marked **TBD** are missing. Do not invent them. Use clearly labelled placeholders and list them in the final handover.

## 1. Goal
Get Ansh hired. A visitor (creator, brand, agency, couple, event organiser) should see strong work within 5 seconds and be able to send a project enquiry in under a minute.

Primary action: **Send enquiry** (contact form).
Secondary actions: watch showreel, open Instagram/YouTube, open Drive for full samples.

## 2. Person and positioning
- **Name:** Ansh Vaishnav
- **Title:** Video Editor, short-form and long-form content
- **Location:** Jaipur, India (works remotely with clients worldwide)
- **Experience:** 2+ years professional
- **Tagline direction:** retention-focused editing, pacing, sound design, clean transitions (from resume)
- **Tool:** Adobe Premiere Pro (Advanced). Do **not** list After Effects, DaVinci or others unless Ansh confirms.

## 3. Services (verified by Ansh)
1. YouTube long-form
2. Shorts, Reels (short-form)
3. Ads
4. Wedding videos
5. Short films
6. Events
7. Social media content

Note: resume shows strong proof for YouTube long-form, reels, interview-style and montage edits. **Wedding, short film, ads and events have no proof in the resume. Need at least 1 sample each (TBD), otherwise show them as services without a project card.**

## 4. Proof points (from resume)
| Claim | Source |
|---|---|
| 30+ long-form YouTube videos for a creator with 1.5M+ subscribers | Comic Explained, 2024-25 |
| 70+ short-form reels for multiple clients | Xo Marketing Agency, 2023-24 |
| 3-4 videos per week, montage and interview edits | Health 360 Clinic, 2023-24 |
| 1 travel reel per day | Eratic Ways Travelling Agency, 2022-23 |
| Reviewed and quality-checked junior editors' work | Xo Marketing Agency |
| Content reaching millions of views | Resume summary |

**TBD:** Ansh's permission to show client names and logos publicly. If not given, show the numbers without names.

## 5. Content inventory
| Item | Status |
|---|---|
| Resume | Provided |
| YouTube: youtube.com/@sidequestgaming04 | Provided. Ansh's **personal gaming channel** where he posts his own edited videos. Show as "My own channel": proof of consistency and personal editing style, separate from client work. |
| Instagram: instagram.com/side.quest.gaming | Provided. Personal, same treatment as YouTube. |
| Google Drive (client edits) | Provided by Ansh: **4 folders**: 1 long-form video, 2 reels folders (different categories), and 1 more folder (**TBD: what is in it?**). Folder names and category per folder: **TBD**. |
| 6-8 best videos, with title, type and one-line outcome | **TBD** (pick from Drive) |
| Showreel (30-60 s) | **TBD**. If none, build one from best clips. |
| Profile photo | **TBD** |
| Testimonials | **TBD** (optional) |
| Pricing or packages | **TBD**. Default: no public prices, "Get a quote". |
| Public contact details | Resume has phone and email. **Confirm which to show publicly.** Default: email plus form only. |

## 6. Pages and sections
Single-page site (Phase 1):
**Principle: the work is the product. A client must see Ansh's videos playing within the first screen, with no click needed.**

1. **Hero:** muted autoplay showreel as the background or main frame, one-line positioning, CTA "See my work". The scroll-driven timeline animation is secondary and must never push videos below the fold.
2. **Work (immediately after the hero):** filterable grid (YouTube / Shorts and Reels / Ads / Wedding / Short film / Events). Videos autoplay muted on hover (desktop) or when in view (mobile). Click opens a full player modal with sound. Each card shows type plus one-line result (e.g. "30+ videos, 1.5M channel").
   - Vertical (9:16) grid for Reels and Shorts, 16:9 for YouTube, so each format is shown the way clients will see it.
   - Order: strongest 3 projects first.
3. **Services:** the 7 services above, one line each
4. **About:** short bio, experience highlights, Premiere Pro
5. **Contact:** form (name, email, project type, budget, message) saved to MongoDB, plus Instagram and YouTube links

Later (not now): showreel page, blog, individual project pages.

## 7. Functional requirements
- Contact form validates input and stores leads in MongoDB; shows success or clear error
- Project data lives in one file (`lib/data.ts`). Adding a project must not need code changes elsewhere.
- Videos: Drive links are **not** reliable for embedding. Use YouTube/Vimeo embeds or compressed MP4 on a CDN (Cloudinary/Bunny). Keep Drive as "full samples" link only.
- SEO: title, description, OG image, sitemap
- Analytics: Vercel Analytics or Plausible

## 8. Design
- Palette: bg `#0B0B0F`, surface `#14141C`, primary `#7C3AED`, light `#A78BFA`, deep `#2E1065`, text `#F5F5F7`, muted `#9CA3AF`
- Purple is an accent (about 10%). Video thumbnails are the hero, not the UI.
- Animations (in priority order): timeline hero, WebGL hover transition on work cards, horizontal GSAP gallery, custom cursor, cut-style page transitions
- Must respect `prefers-reduced-motion`
- Details go in `DESIGN.md`

## 9. Stack
Next.js (App Router), React, TypeScript, Tailwind v4, `motion`, GSAP + ScrollTrigger, Lenis, Three.js / React Three Fiber, MongoDB (Mongoose), Vercel.

## 10. Success criteria
- Lighthouse: Performance 90+ (mobile), Accessibility 95+, SEO 95+
- Works on real phones (Android Chrome, iOS Safari)
- Hero loads in under 2.5 s on 4G
- Contact form delivers a lead to MongoDB end to end
- Heavy effects (WebGL) fall back gracefully on mobile and low-power devices

## 11. Out of scope (for now)
Online payments, client login or proofing portal, CMS dashboard, multi-language, blog.

## 12. Open questions for Ansh
1. (Answered) The gaming YouTube and Instagram are personal channels. Show them as "My channel" in a separate section from client work.
2. Can client names (e.g. Comic Explained) be shown?
3. Which email and phone go public?
4. Does he have wedding, short film, ad and event samples? Links please.
5. Does he use After Effects or any tool besides Premiere Pro?
6. Pricing: public, or "request a quote"?
7. Domain name (e.g. anshvaishnav.com) available or not?
