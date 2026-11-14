import React from "react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6 py-20">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface border border-line text-lilac font-display text-2xl font-bold mb-6">
        404
      </div>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink font-[family-name:var(--font-bricolage)] mb-3">
        Page not found
      </h1>
      <p className="text-sm sm:text-base text-mute max-w-md mb-8">
        The page you are looking for does not exist.
      </p>
      <Button asLink href="/" variant="primary" size="md">
        Back to home
      </Button>
    </section>
  );
}

