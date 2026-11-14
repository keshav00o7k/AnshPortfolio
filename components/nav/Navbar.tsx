"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig, navLinks } from "@/lib/data";
import { Button } from "@/components/ui/Button";
import { MobileMenu } from "./MobileMenu";

export const Navbar: React.FC = () => {
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Cleanly clear any active hash from the browser address bar
      window.history.pushState(null, "", "/");
    }
  };

  const handleNavLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.includes("#") && pathname === "/") {
      e.preventDefault();
      const hash = href.split("#")[1];
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `#${hash}`);
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 md:px-8 pt-4">
      <div
        className="w-full max-w-5xl bg-surface/80 backdrop-blur-md border border-line px-6 py-3 flex items-center justify-between transition-all duration-300 shadow-lg rounded-tl-[8px] rounded-tr-[40px] rounded-br-[8px] rounded-bl-[40px]"
        style={{ borderRadius: "8px 40px 8px 40px" }}
      >
        {/* Brand / Logo */}
        <Link
          href="/"
          onClick={handleLogoClick}
          className="text-base md:text-lg font-semibold tracking-tight text-ink hover:text-violet transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac rounded"
        >
          {siteConfig.name}
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavLinkClick(e, link.href)}
              className="text-sm font-medium text-mute hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac rounded px-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right CTA Button (Desktop) */}
        <div className="hidden md:block">
          <Button asLink href="/contact" variant="primary" size="sm">
            Let&apos;s talk
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <MobileMenu />
      </div>
    </header>
  );
};
