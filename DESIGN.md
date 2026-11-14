# DESIGN.md: Ansh Vaishnav Portfolio

Read `REQUIREMENTS.md` first. Core principle: **the videos are the hero, the UI is the frame.** If the UI is louder than the work, the design has failed.

## 1. Mood
Dark, cinematic, premium, like a colour-grading suite or an editing timeline. Calm surfaces, one confident purple accent, motion that feels like editing (cuts, scrubs, wipes), not generic fades.

Avoid: gaming-channel neon, crypto-style gradients, glow on every card, purple + pink + blue mixes.

## 2. Colour tokens
| Token | Hex | Use |
|---|---|---|
| `bg` | `#0B0B0F` | page background (never pure `#000`) |
| `surface` | `#14141C` | cards, modal, form fields |
| `line` | `#262633` | borders, dividers |
| `violet` | `#7C3AED` | primary buttons, key highlights |
| `lilac` | `#A78BFA` | hover, links, small accents, purple text |
| `deep` | `#2E1065` | background glows, dark gradients |
| `ink` | `#F5F5F7` | main text |
| `mute` | `#9CA3AF` | secondary text |

Rules: purple is about 10% of any screen. Purple text only in `lilac`, never `deep`. Gradients only `bg` to `deep`, soft, behind hero and contact. Body text contrast 4.5:1 minimum.

## 3. Typography
- Display: **Bricolage Grotesque** (600). Hero 56-120px, tight leading (0.98), tracking slightly negative.
- Body and UI: **Instrument Sans** (400/500), 16-18px.
- Timecode and tiny labels: system monospace, tabular numbers.
- Max line length 65ch. Sentence case everywhere. No all-caps eyebrow labels.

## 4. Layout and spacing
- Mobile first. Breakpoints: 640 / 768 / 1024 / 1280.
- Side padding: 24px mobile, 48px desktop. Section padding: 112px vertical (desktop), 72px (mobile).
- Radius: 16px for cards, 999px for buttons, 12px for inputs.
- Max content width 1280px except hero and gallery, which are full-bleed.

## 5. Page structure (single page)
1. **Nav:** name left, Work / Services / Contact right, translucent blur. On mobile a simple menu button.
2. **Hero:** showreel muted autoplay in frame. Headline (one line of positioning), subline, CTA "See my work". Scroll-driven timeline (playhead and timecode) below, secondary to the video.
3. **Client Work:** filter chips (All / YouTube / Reels / Ads / Wedding / Short film / Events). Grid by format: 16:9 for long-form, 9:16 for reels. Card: video preview, title, category, one-line result.
4. **Horizontal gallery** (optional on desktop): pinned section scrolling the 3 strongest projects sideways.
5. **My Channel:** separate, smaller. 3-4 embeds from his personal YouTube plus Instagram link. Copy: "I also make my own videos."
6. **Services:** the 7 services, list style with hover line.
7. **About:** short bio, 3 proof numbers (30+ long videos, 70+ reels, 2+ years), Premiere Pro.
8. **Contact:** form + Instagram/YouTube links. Footer.

## 6. Motion system
Easing: `cubic-bezier(0.22, 1, 0.36, 1)` for entrances, `ease-in-out` for scrubs. Durations: micro 150-250ms, reveal 600-900ms, page transition 500ms. Animate only `transform`, `opacity`, `filter`.

| # | Effect | Where | Tool | Priority |
|---|---|---|---|---|
| 1 | Timeline scrub (playhead, timecode, clips light up) | Hero | `motion` useScroll | must |
| 2 | Video preview on hover, in-view autoplay on mobile | Work cards | native video + IntersectionObserver | must |
| 3 | Shared-layout card to modal expand | Work | `motion` layoutId | must |
| 4 | Smooth scroll | Global | Lenis | must |
| 5 | Staggered reveal on enter | Sections | `motion` whileInView | must |
| 6 | WebGL displacement / ripple on card hover | Work cards | R3F + shader | should (desktop only) |
| 7 | Horizontal pinned gallery | Section 4 | GSAP ScrollTrigger | should (desktop only) |
| 8 | Custom cursor ("Play" on video cards) | Desktop | motion | should |
| 9 | Cut-style wipe page/section transition | Global | motion | could |
| 10 | Service row hover line and slide | Services | motion variants | must |

Fallbacks: touch devices and `prefers-reduced-motion` get no WebGL, no custom cursor, no pinned gallery, and no scrub (static state). Never block content behind an animation.

## 7. Components
- **Button:** primary = `violet` fill, pill, soft purple shadow on hover only. Secondary = border `line`, text `ink`, border to `lilac` on hover.
- **Video card:** rounded 16px, gradient overlay from bottom for text, title in display font, category in `mute`.
- **Modal:** dark overlay with blur, player with controls and sound, close button reachable by keyboard, `Esc` closes, focus trapped.
- **Form fields:** `surface` background, `line` border, `lilac` focus border. Labels via `aria-label` or visible label.

## 8. Performance budget
- Initial JS under 200KB gzip (WebGL code lazy-loaded).
- Hero video under 4MB (muted, H.264, 720p max for mobile variant), poster image shown first.
- Card previews 3-5s loops under 2MB each, lazy loaded.
- Full videos load only on click.
- LCP under 2.5s on 4G. Lighthouse mobile 90+.

## 9. Accessibility
Visible focus ring (`lilac`), keyboard nav for all controls, alt text or `aria-label` on media, videos muted by default with captions where possible, motion respects `prefers-reduced-motion`.

## 10. Inspiration (fill in)
Ansh or client picks 3 sites from Awwwards (Film-TV, Photo and Video, Transitions filters) and pastes links here. Agent must study layout, transitions and pacing, not copy visuals.
1. TBD
2. TBD
3. TBD
