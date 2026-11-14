# ASSETS.md: Media Inventory & Tracking

> **Status:** All categories are marked as **UNCONFIRMED** and client names remain **PRIVATE** (`showClientName: false`) until confirmed by Ansh.
>
> **Serving Note:** Raw MP4 files reside in `public/videos/` and are excluded from git commits via `.gitignore`. Original files remain in the root directory.

---

## 1. Local MP4 Video Files (Vertical 9:16 in `public/videos/`)

| # | Neutral Path | Original Source File (Root) | Size | Duration | Resolution | Format | Suggested Category | Status / Permissions |
|---|---|---|---|---|---|---|---|---|
| 1 | `/videos/reel-01.mp4` | `Lokmanthan 2.mp4` | 5.88 MB | 37.4s | 720x1280 | 9:16 | UNCONFIRMED (Event / Social Reel) | `showClientName: false` (Hero Placeholder) |
| 2 | `/videos/reel-02.mp4` | `Bansal 2.mp4` | 6.88 MB | 62.3s | 720x1280 | 9:16 | UNCONFIRMED (Social Media Reel) | `showClientName: false` |
| 3 | `/videos/reel-03.mp4` | `Taazafal.mp4` | 8.49 MB | 33.6s | 720x1280 | 9:16 | UNCONFIRMED (Commercial / Brand Reel) | `showClientName: false` |
| 4 | `/videos/reel-04.mp4` | `Nanuwala 2.mp4` | 11.33 MB | 40.8s | 720x1280 | 9:16 | UNCONFIRMED (Social Media Reel) | `showClientName: false` |
| 5 | `/videos/reel-05.mp4` | `Mittal Garments.mp4` | 12.79 MB | 43.1s | 720x1280 | 9:16 | UNCONFIRMED (Commercial / Ad Reel) | `showClientName: false` |
| 6 | `/videos/reel-06.mp4` | `Malad 6 oct 2026.mp4` | 15.11 MB | 7.0s | 1080x1920 | 9:16 | UNCONFIRMED (Short Reel) | `showClientName: false` |
| 7 | `/videos/reel-07.mp4` | `Ts 16 oct 2026.mp4` | 30.10 MB | 14.3s | 1080x1920 | 9:16 | UNCONFIRMED (Social Media Reel) | `showClientName: false` |
| 8 | `/videos/reel-08.mp4` | `Cocktail Sat Night 24 oct 2026.mp4` | 38.38 MB | 16.8s | 1080x1920 | 9:16 | UNCONFIRMED (Event / Party Reel) | `showClientName: false` |
| 9 | `/videos/reel-09.mp4` | `Brunatos 15 oct 2026_1.mp4` | 60.88 MB | 13.5s | 1080x1920 | 9:16 | UNCONFIRMED (Social Media Reel) | `showClientName: false` |

---

## 2. YouTube Embeds (Horizontal 16:9)

| # | YouTube ID | Full URL | Format | Suggested Category | Status / Permissions |
|---|---|---|---|---|---|
| 1 | `cavZT0nrt9Q` | `https://www.youtube.com/watch?v=cavZT0nrt9Q` | 16:9 | UNCONFIRMED (YouTube Long-form / Channel) | `showClientName: false` |
| 2 | `_RTXmYCO6G8` | `https://www.youtube.com/watch?v=_RTXmYCO6G8` | 16:9 | UNCONFIRMED (YouTube Long-form / Channel) | `showClientName: false` |
| 3 | `Zx_cYrybjzY` | `https://www.youtube.com/watch?v=Zx_cYrybjzY` | 16:9 | UNCONFIRMED (YouTube Long-form / Channel) | `showClientName: false` |

---

## 3. Data Integration Rules
* **No hard-coded paths**: Components call `getProjects()` from `lib/data.ts`.
* **Poster fallback**: If `posterUrl` is omitted for any local video, the player automatically falls back to `${videoUrl}#t=0.1`.
* **YouTube embeds**: Use `https://www.youtube-nocookie.com/embed/{id}` strictly inside modal players.
