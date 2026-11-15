import { NextRequest, NextResponse } from "next/server";
import {
  verifyCsrfOrigin,
  verifyPassword,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  // 1. Strict CSRF verification
  if (!verifyCsrfOrigin(request)) {
    return NextResponse.json(
      { error: "Forbidden: Cross-site request rejected" },
      { status: 403 }
    );
  }

  // 2. Parse payload safely
  let password = "";
  try {
    const body = await request.json();
    if (body && typeof body.password === "string") {
      password = body.password;
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request format" },
      { status: 400 }
    );
  }

  if (!password) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  // 3. Verify password via async scrypt
  try {
    const isValid = await verifyPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }
  } catch (err) {
    console.error(
      "Admin login authentication error:",
      err instanceof Error ? err.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Authentication service unavailable" },
      { status: 500 }
    );
  }

  // 4. Issue 12-hour signed session token
  try {
    const sessionToken = createSessionToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (err) {
    console.error(
      "Admin session token generation error:",
      err instanceof Error ? err.message : "Unknown error"
    );
    return NextResponse.json(
      { error: "Failed to establish session" },
      { status: 500 }
    );
  }
}

