import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Admin Panel | Ansh Portfolio",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-violet selection:text-white">
      {children}
    </div>
  );
}

