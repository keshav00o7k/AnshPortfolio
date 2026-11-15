"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Invalid credentials");
        return;
      }

      // Login successful, redirect to admin dashboard
      router.push("/admin");
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-line bg-surface p-6 shadow-xl sm:p-8">
        <div>
          <h2 className="text-center font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-xs text-mute sm:text-sm">
            Authenticate to manage portfolio assets and media.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50/80 p-3.5 text-center text-xs font-medium text-red-800"
          >
            {error}
          </div>
        )}

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-ink"
            >
              Master Password
            </label>
            <div className="mt-1.5">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-mute/60 focus:border-violet focus:outline-none focus:ring-2 focus:ring-lilac/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-lg bg-violet py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-violet-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-lilac disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Verifying..." : "Sign in to Dashboard"}
          </button>
        </form>

        <div className="border-t border-line/60 pt-4 text-center">
          <Link
            href="/"
            className="text-xs text-mute hover:text-ink transition-colors"
          >
            ← Return to public site
          </Link>
        </div>
      </div>
    </div>
  );
}

