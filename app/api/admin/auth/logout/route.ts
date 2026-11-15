import { NextRequest, NextResponse } from "next/server";
import { verifyCsrfOrigin, SESSION_COOKIE_NAME } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json(
      { error: "Forbidden: Cross-site request rejected" },
      { status: 403 }
    );
  }

  const isHtml = request.headers.get("accept")?.includes("text/html");
  const response = isHtml
    ? NextResponse.redirect(new URL("/admin/login", request.url), 303)
    : NextResponse.json({ success: true, redirect: "/admin/login" });

  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}

