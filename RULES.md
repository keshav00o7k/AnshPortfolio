# RULES.md: Instructions for the coding agent

Read `REQUIREMENTS.md` and `DESIGN.md` before every task. If they conflict with a user message, ask before proceeding.

## 1. How to work
1. **Plan first.** For any task, reply with a short plan (files to touch, approach) and wait for approval before writing code.
2. **One feature per task.** Build only what was asked. Do not touch unrelated files or refactor "while you're there".
3. **Show the diff.** At the end, list files changed and how to test.
4. **Run it.** Run `npm run build` and `npm run lint` before saying a task is done. Report errors honestly, do not hide them.
5. **Small commits.** One commit per feature, message format: `feat: hero timeline`, `fix: modal focus trap`.
6. If something is unclear or missing, **ask**. Do not guess.

## 2. Never invent content
- No made-up client names, view counts, testimonials, prices, or video titles.
- Use only facts from `REQUIREMENTS.md`. Missing content stays as a clearly marked placeholder (`TODO:` in code and visible `Placeholder` style) and is listed in the final handover.
- Do not list tools other than Adobe Premiere Pro as skills.
- Do not publish the phone number. Use email and the contact form only, unless told otherwise.

## 3. Stack (fixed, do not swap)
Next.js (App Router), React, TypeScript strict, Tailwind v4, `motion` (import from `motion/react`), GSAP + ScrollTrigger, Lenis, Three.js / React Three Fiber, MongoDB with Mongoose, deployed on Vercel.

Do not add a new dependency without asking. Pin versions at least 2 weeks old (avoid brand-new releases). Exception: official security patches (e.g. Next.js 16.4.x security release) are allowed.

## 4. Code standards
- TypeScript `strict`. No `any` without a comment explaining why.
- One component per file in `components/`. Server components by default, `"use client"` only where needed (animation, state, browser APIs).
- All colours, fonts and spacing come from the Tailwind theme tokens in `globals.css`. No hard-coded hex in components.
- Components never hard-code video paths. All media URLs come from `lib/data.ts` through an async `getProjects()` function, allowing seamless swap to MongoDB + Cloudinary later without UI changes.
- Project data shape:
  ```ts
  type Project = {
    id: string;
    title: string;
    category: "youtube" | "reel" | "ad" | "wedding" | "film" | "event";
    format: "16:9" | "9:16";
    result: string;                // one-line outcome
    clientLabel: string;          // anonymous label
    clientName?: string;          // optional real name
    showClientName: boolean;      // default: false
    videoUrl: string;             // path in public/videos/ or remote URL
    posterUrl?: string;           // optional; if omitted, use `${videoUrl}#t=0.1` for first frame
    youtubeId?: string;           // full video embed ID
    isPlaceholder: boolean;
  };
  ```
- Names: components `PascalCase`, files match component name, hooks `useThing`.
- No dead code, no commented-out blocks, no `console.log` left behind.

## 5. Animation rules
- Follow the motion table in `DESIGN.md`. Do not add effects that are not listed.
- Animate only `transform`, `opacity`, `filter`. Never animate `width`, `height`, `top`, `left`.
- Every animated component must respect `prefers-reduced-motion` and render a complete static state.
- WebGL, custom cursor and pinned gallery: **desktop only**, lazy-loaded with `next/dynamic`, with a plain fallback.
- Dispose Three.js geometries, materials and textures on unmount. Clean up GSAP ScrollTrigger and Lenis in effect cleanup.
- Animations must never hide content or delay interaction for more than 1 second.

## 6. Video rules
- Phase A video serving: use original videos directly from `public/videos/` (frontend only, no compression step now).
- Do not commit video files: add `public/videos/` to `.gitignore`.
- Hero and card previews: `muted`, `loop`, `playsInline`, `preload="none"` or `"metadata"`.
- Posters: if `posterUrl` is missing, use `${videoUrl}#t=0.1` for the first frame.
- Grid cards: play only on hover (desktop) or when in view (mobile). Only one video plays at a time. Pause when off-screen.
- Full videos load only on click in the modal player. Use `youtube-nocookie.com` for embeds.
- Do **not** embed Google Drive videos. Drive links are used only for the "More samples" link.
- Track all media in `ASSETS.md` with category as UNCONFIRMED and `clientName` private (`showClientName: false`) until Ansh confirms.

## 7. Performance and accessibility (definition of done)
A task is done only when:
- [ ] `npm run build` and `npm run lint` pass with no errors
- [ ] Works at 360px, 768px and 1280px widths
- [ ] Keyboard navigable, visible focus, `Esc` closes modals
- [ ] Reduced-motion tested
- [ ] No layout shift from images/videos (set aspect ratios)
- [ ] Lighthouse mobile Performance 90+ for the page touched

## 8. Backend and security
- Contact API: validate input server-side (name, email format, message length), trim and cap lengths, return clear errors.
- Rate-limit the contact endpoint (simple per-IP limit) to stop spam.
- Secrets only in `.env.local`, never in code, prompts, or commits. Keep `.env.example` updated.
- Never log full user messages or emails to the console in production.
- MongoDB connection reused via a cached global (as in `lib/mongodb.ts`).

## 9. SEO and meta
Title, description, Open Graph image, favicon, `sitemap.xml`, `robots.txt`, semantic HTML (`main`, `nav`, `section`, one `h1`).

## 10. Task order (follow this)

### PHASE A (Now: Simple, clean, fully responsive, professional site)
Animations allowed in Phase A: only simple section fade/slide-up on scroll, button hover, modal open/close. Nothing else.
1. Project setup, fonts, theme tokens, nav, footer (no Lenis)
2. Hero with showreel (clean framed video hero; no timeline scrub)
3. Client Work grid, dynamic filters, card video preview, modal player
4. My Channel section (personal gaming channel embeds)
5. Services and About
6. Contact form and API with MongoDB
7. SEO, performance pass, accessibility pass
8. Deploy to Vercel and handover list of remaining placeholders

### PHASE B (Later: Only when explicitly requested — DEFERRED, DO NOT BUILD)
- WebGL hover displacement / shader ripple (deferred, do not build)
- GSAP pinned horizontal gallery (deferred, do not build)
- Custom cursor (deferred, do not build)
- Timeline scrub on hero (deferred, do not build)
- Cut-style page transitions (deferred, do not build)
- Lenis smooth scroll (deferred, do not build)

Stop after each step and wait for review.
