# Ansh Vaishnav — Video Editor Portfolio

A high-performance, retention-focused video editing portfolio website built for **Ansh Vaishnav**. Crafted with Next.js 16 (App Router), React 19, Tailwind CSS, Motion (Framer Motion), and GSAP.

---

## 🌟 Live Features & Highlights

### 1. 📇 Interactive 3D Hanging Lanyard Hero
- **Physics-Driven ID Badge**: Real-time numerical physics integration (gravity, cord spring, bounce, 3D tilt, sway, and cursor momentum tracking) powered by GSAP.
- **Custom Branded Assets**: Custom-designed deep violet woven fabric lanyard strap and polished chrome metal clip with a 3D slot split that threads through the card.
- **Artistic Typography**: Background *"video editor"* lettering rendered in handwritten Caveat script, with handwritten greeting note *"hello! have a nice day ✨"*.
- **Ready for Custom Portrait**: Fitted with a high-res photo frame and *"VIDEO EDITOR"* badge, ready for portrait replacement.

### 2. 🎬 3D Cylindrical Reel Coverflow Showcase
- **Radial Amphitheater Perspective**: Pure non-linear cylindrical 3D arc math (\(x = R \sin\theta\), \(z = R(\cos\theta - 1)\), \(\text{rotateY} = -\theta\)) creating a natural curved arc where adjacent cards step back into depth without overlapping.
- **Gestural Navigation**: Supports mouse click-and-drag, mobile touch swiping, trackpad/wheel horizontal scrolling, and floating arrow navigation with spring momentum deceleration.
- **Dual Audio Experience**: Reels autoplay silently in the background (`muted`, `loop`, `playsInline`), and clicking any card opens the video in a responsive player with **full sound** and controls.

### 3. 💼 Selected Work & Project Filtering
- Clean, uncluttered 9:16 vertical reel grid showcasing pacing, storytelling, and sound design.
- Dynamic filter chips that automatically adapt to project categories (Reels, YouTube, Ads, Commercials).
- Direct external link integration for Google Drive portfolio reels.

### 4. 🎮 Side Quest Gaming Channel Section
- Dedicated showcase for Ansh's personal gaming channel edits (`@sidequestgaming04`).
- High-performance 16:9 responsive video cards with custom hover overlays and full-screen modal player.

### 5. 🛠️ Floating Tools Call-to-Action
- Floating vector badges for industry-standard creative software:
  - **Adobe Premiere Pro**
  - **DaVinci Resolve**
  - **Adobe After Effects**
  - **CapCut**
  - **Blender**
  - **Canva**
  - **Apple Final Cut Pro**
- Dynamic floating physics and organic hover interactions surrounding an editorial call-to-action.

### 6. 📊 Verified Proof Metrics & Work History
- Compact, content-packed stat cards showcasing verified career milestones:
  - **30+** Long-form videos for a creator with 1.5M+ subscribers
  - **70+** Short-form reels across multiple industries
  - **2+** Years of professional Premiere Pro experience
- Structured work history timeline highlighting client achievements without non-disclosure violations.

### 7. 📬 Dedicated Contact Page & Lead Capture
- Full editorial 2-column contact interface:
  - Creator client avatars with **4.9/5** rating proof
  - Platform multi-select (YouTube, Instagram Reels, Shorts, Commercial Ads)
  - Budget tier selection and structured message submission
  - Direct email one-click copy feedback

---

## 🚀 Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **Next.js 16.4** | React Framework with App Router, static page pre-rendering, and metadata generation |
| **React 19** | Component architecture, concurrent features, and hooks |
| **TypeScript** | Strict type-safety across all data models and UI interfaces |
| **Tailwind CSS 4** | Utility-first styling with modern fluid typography and responsive spacing |
| **Motion (Framer Motion)** | Fluid layout transitions, spring physics, and viewport scroll reveals |
| **GSAP** | High-precision numerical physics loop for the 3D lanyard badge |
| **Google Fonts** | Bricolage Grotesque, Instrument Sans, Playfair Display, Caveat, Permanent Marker, Patrick Hand |

---

## 📁 Project Structure

```
anshPortfolio/
├── app/
│   ├── contact/
│   │   └── page.tsx              # Dedicated /contact page
│   ├── globals.css               # Global theme variables & styling
│   ├── layout.tsx                # Root layout with font declarations & navbar/footer
│   ├── page.tsx                  # Single-page portfolio flow
│   ├── robots.ts                 # Search engine crawlers config
│   └── sitemap.ts                # Dynamic XML sitemap
├── components/
│   ├── about/                    # Bio, Proof numbers, and Work history
│   ├── channel/                  # Side Quest Gaming video cards & grid
│   ├── contact/                  # Contact form & lead capture
│   ├── cta/                      # Floating tools & project CTA section
│   ├── footer/                   # Site footer with back-to-top & social links
│   ├── hero/
│   │   ├── HomeHero.tsx          # Lanyard Hero section with theme integration
│   │   └── Lanyard.tsx           # GSAP physics-driven ID badge engine
│   ├── nav/                      # Floating pill navbar & mobile slide-out menu
│   ├── services/                 # Video editing services grid
│   ├── ui/                       # Shared buttons, badges, section starters
│   └── work/
│       ├── ReelCoverflowSection.tsx # 3D Cylindrical Reel Carousel
│       ├── ProjectCard.tsx       # Individual reel card with lazy loading
│       ├── VideoModal.tsx        # High-res video modal with sound & controls
│       └── WorkGrid.tsx          # Responsive multi-column selected work grid
├── lib/
│   ├── contact.ts                # Lead capture submission handler
│   └── data.ts                   # Static data catalog (projects, metrics, services, social links)
├── public/
│   ├── lanyard/                  # SVG assets for lanyard strap & metal clasp
│   ├── tools/                    # Vector software logos (Pr, Ae, DaVinci, etc.)
│   └── videos/                   # Vertical 9:16 sample reels
├── types/
│   └── index.ts                  # TypeScript definitions for projects, services & metrics
└── package.json
```

---

## 💻 Getting Started Locally

### Prerequisites
- **Node.js**: v18.18.0 or newer
- **npm** or **pnpm**

### Installation

1. Clone your repository:
   ```bash
   git clone https://github.com/keshav00o7k/AnshPortfolio.git
   cd AnshPortfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

To test the production build:
```bash
npm run build
npm run start
```

---

## 🎨 How to Customize

### 1. Update the Lanyard Portrait Photo
In `components/hero/HomeHero.tsx`, locate the `portrait` prop:
```tsx
export const HomeHero: React.FC<HomeHeroProps> = ({
  portrait = "/path-to-your-photo.jpg", // Replace with your image URL or /portrait.jpg
  ...
```

### 2. Add or Edit Projects & Videos
All project data, reels, and YouTube videos are managed centrally in `lib/data.ts`:
- **Selected Work**: Edit the `projects` array.
- **Side Quest Gaming Videos**: Edit the `channelVideos` array.
- **Reel Carousel Items**: Managed in `components/work/ReelCoverflowSection.tsx`.

### 3. Update Social Links & Contact Info
In `lib/data.ts`, update `siteConfig`:
```typescript
export const siteConfig: SiteConfig = {
  name: "Ansh Vaishnav",
  title: "Video editor, short-form and long-form content",
  location: "Jaipur, India",
  email: "anshvaishnav2004@gmail.com",
  driveUrl: "https://drive.google.com/...", // Add your public portfolio Drive link
  youtubeChannelUrl: "https://youtube.com/@sidequestgaming04",
  instagramUrl: "https://instagram.com/side.quest.gaming",
};
```

### 4. Contact Form Email Delivery (Resend)

Contact form submissions are processed server-side via `POST /api/contact` using native `fetch` to Resend.

Required environment variables:
- `RESEND_API_KEY`: API key from [resend.com](https://resend.com).
- `CONTACT_EMAIL`: Recipient email inbox where inquiries will land.
- `CONTACT_FROM`: Sender address (defaults to `onboarding@resend.dev`).

> [!NOTE]
> While using `onboarding@resend.dev` as the sender, Resend **strictly delivers only to the email address registered to your Resend account**. It is intended for development and testing. For production delivery or custom branding, verify your custom domain in Resend DNS settings (e.g. `Ansh Vaishnav <contact@yourdomain.com>`).

#### Post-Deployment Verification Checklist
- [ ] Ensure `RESEND_API_KEY`, `CONTACT_EMAIL`, and `CONTACT_FROM` are configured in Vercel Environment Variables.
- [ ] **Send one real test message after every deploy**: Submit the form on the live site with valid details and verify it arrives in your inbox.

---

## 📄 License

This project is created for **Ansh Vaishnav**. All rights reserved.

