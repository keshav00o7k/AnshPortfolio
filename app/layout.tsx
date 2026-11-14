import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Instrument_Sans,
  Playfair_Display,
  Permanent_Marker,
  Caveat,
  Patrick_Hand,
} from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/nav/Navbar";
import { Footer } from "@/components/footer/Footer";
import { ScrollManager } from "@/components/nav/ScrollManager";
import { siteConfig } from "@/lib/data";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["600", "700"],
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400", "500", "600"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  weight: ["400", "700"],
  display: "swap",
});

const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  variable: "--font-permanent-marker",
  weight: ["400"],
  display: "swap",
});

const patrickHand = Patrick_Hand({
  subsets: ["latin"],
  variable: "--font-patrick-hand",
  weight: ["400"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const allowIndexing = process.env.ALLOW_INDEXING === "true";

export const viewport: Viewport = {
  themeColor: "#F8F5FA",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteConfig.name} | Video Editor`,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Retention-focused video editor specializing in YouTube long-form and social media reels. Pacing, sound design, and clean transitions in Adobe Premiere Pro.",
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  openGraph: {
    title: `${siteConfig.name} | Video Editor`,
    description:
      "Retention-focused video editor specializing in YouTube long-form and social media reels. Pacing, sound design, and clean transitions in Adobe Premiere Pro.",
    url: "/",
    siteName: `${siteConfig.name} Portfolio`,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Video Editor`,
    description:
      "Retention-focused video editor specializing in YouTube long-form and social media reels. Pacing, sound design, and clean transitions in Adobe Premiere Pro.",
  },
  robots: {
    index: allowIndexing,
    follow: allowIndexing,
    nocache: !allowIndexing,
    googleBot: {
      index: allowIndexing,
      follow: allowIndexing,
      noimageindex: !allowIndexing,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${instrument.variable} ${playfair.variable} ${caveat.variable} ${permanentMarker.variable} ${patrickHand.variable}`}
    >
      <body className="bg-bg text-ink min-h-screen flex flex-col antialiased">
        <ScrollManager />
        <Navbar />
        <main className="flex-1 pt-24">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
