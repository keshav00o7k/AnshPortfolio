"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/data";
import { Button } from "@/components/ui/Button";

export const MobileMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => {
    setIsOpen(false);
    toggleButtonRef.current?.focus();
  };

  const handleNavLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    close();
    if (href.includes("#") && pathname === "/") {
      e.preventDefault();
      const hash = href.split("#")[1];
      const el = document.getElementById(hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `#${hash}`);
        }, 150);
      }
    }
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (!isOpen) return;

    // eslint-disable-next-line react-hooks/immutability
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        ref={toggleButtonRef}
        onClick={toggle}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        aria-controls="mobile-nav-menu"
        className="min-w-[44px] min-h-[44px] p-2 flex items-center justify-center text-mute hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-lilac rounded-full transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {isOpen && (
        <div
          id="mobile-nav-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation menu"
          className="fixed inset-x-0 top-16 bg-bg/95 backdrop-blur-xl border-b border-line px-6 py-8 flex flex-col gap-6 shadow-2xl z-50"
        >
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavLinkClick(e, link.href)}
                className="text-lg font-medium text-mute hover:text-ink transition-colors py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lilac rounded"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-4 border-t border-line">
            <Button
              asLink
              href="/contact"
              variant="primary"
              size="md"
              className="w-full"
              onClick={close}
            >
              Let&apos;s talk
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
