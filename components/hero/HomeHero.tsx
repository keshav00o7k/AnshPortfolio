"use client";

import React from "react";
import Link from "next/link";
import LanyardBadge, { defaultLanyardProps } from "./Lanyard";

interface HomeHeroProps {
  portrait?: string;
  strap?: string;
  clasp?: string;
  style?: React.CSSProperties;
}

export const HomeHero: React.FC<HomeHeroProps> = ({
  portrait = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&auto=format&fit=crop&q=85",
  strap = "/lanyard/strap.svg",
  clasp = "/lanyard/clasp.svg",
  style,
}) => {
  const defaults = defaultLanyardProps;

  const handleScrollToWork = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      e.preventDefault();
      const el = document.getElementById("work");
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", "#work");
      }
    }
  };

  // The Hanging ID Badge Card
  const card = (
    <div
      style={{
        position: "relative",
        width: 465,
        height: 596,
        borderRadius: 14,
        background: "linear-gradient(135deg, #ffffff 0%, #faf6fb 60%, #f3ebf6 100%)",
        boxShadow:
          "0 30px 60px -12px rgba(63, 19, 69, 0.28), 0 10px 24px -6px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(123, 51, 134, 0.16)",
        padding: 24,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Handwritten greeting at top */}
      <span
        style={{
          position: "absolute",
          top: 68,
          left: 22,
          transform: "rotate(-5deg)",
          fontFamily: "var(--font-caveat), cursive",
          fontSize: 32,
          fontWeight: 700,
          color: "#3F1345",
          letterSpacing: "-0.01em",
          userSelect: "none",
        }}
      >
        hello! have a nice day ✨
      </span>

      {/* Middle Portrait Image (Ready to be replaced with Ansh's photo) */}
      <div
        style={{
          position: "absolute",
          bottom: 24,
          left: 24,
          width: 417,
          height: 463,
          borderRadius: 10,
          overflow: "hidden",
          backgroundColor: "#F3EEF6",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={portrait}
          alt="Portrait of Ansh Vaishnav"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            pointerEvents: "none",
          }}
        />

        {/* Subtle Video Editor Badge pill over portrait */}
        <div
          style={{
            position: "absolute",
            bottom: 14,
            right: 14,
            padding: "5px 12px",
            borderRadius: 999,
            backgroundColor: "rgba(63, 19, 69, 0.88)",
            backdropFilter: "blur(6px)",
            color: "#ffffff",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          }}
        >
          VIDEO EDITOR
        </div>
      </div>
    </div>
  );

  return (
    <section
      id="hero"
      aria-label="Hero section"
      style={{
        width: "100%",
        background: "transparent",
        textAlign: "center",
        marginTop: "-48px",
        paddingTop: 0,
        paddingBottom: "clamp(40px, 6vw, 80px)",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* 3D Hanging Lanyard Stage */}
      <div
        style={{
          position: "relative",
          height: "clamp(480px, 64vh, 720px)",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Giant Artistic Background Text (Replacing UI/UX Designer with Video Editor) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-caveat), cursive",
            fontSize: "clamp(90px, 21vw, 260px)",
            lineHeight: 0.85,
            letterSpacing: "-0.03em",
            color: "#7B3386",
            opacity: 0.12,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
            transform: "translateY(2%)",
          }}
        >
          video editor
        </div>

        {/* Interactive Physics Lanyard Badge */}
        <LanyardBadge
          {...defaults}
          style={{ width: "100%", height: "100%" }}
          strap={{ src: strap }}
          clasp={{ src: clasp }}
          card={[card]}
          layout={{
            ...defaults.layout,
            baseHeight: 830,
            strapH: 22,
            strapOffset: 22,
            claspH: 19,
            claspY: -6,
            cardY: -7,
          }}
          slot={{ ...defaults.slot, width: 92, height: 20 }}
          physics={{
            ...defaults.physics,
            bounce: 0.65,
            tilt3D: 16,
            maxTilt: 32,
          }}
        />
      </div>

      {/* Typography & CTA Below Badge */}
      <div
        style={{
          padding: "24px 20px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          position: "relative",
          zIndex: 10,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-permanent-marker), cursive",
            fontSize: "clamp(56px, 9.2vw, 115px)",
            fontWeight: 400,
            lineHeight: 0.9,
            letterSpacing: "-0.02em",
            color: "#0D0813",
          }}
        >
          I’m ansh
        </h1>

        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-patrick-hand), cursive",
            fontSize: "clamp(18px, 1.8vw, 24px)",
            lineHeight: 1.45,
            letterSpacing: "-0.01em",
            color: "#63596B",
            maxWidth: 720,
          }}
        >
          A retention-focused video editor turning raw footage into high-impact YouTube long-form and viral reels. Pacing, sound design, and clean cuts.
        </p>

        {/* Action Buttons styled in our theme */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-2">
          <Link
            href="/#work"
            onClick={handleScrollToWork}
            className="inline-flex items-center justify-center px-7 py-3 text-xs uppercase font-bold tracking-widest text-white bg-violet hover:bg-[#551D5C] transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
            style={{ borderRadius: "6px 24px 6px 24px" }}
          >
            See my work
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-7 py-3 text-xs uppercase font-bold tracking-widest text-ink hover:text-white bg-surface border-2 border-violet/30 hover:bg-violet hover:border-violet transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 active:scale-95"
            style={{ borderRadius: "6px 24px 6px 24px" }}
          >
            Contact
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;

