import React from "react";
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

export default async function AdminDashboardPage() {
  // Session check strictly verified INSIDE the page component
  const session = await verifyAdminSession();
  if (!session.isAuthenticated) {
    redirect("/admin/login");
  }

  return <AdminDashboard />;
}
