import crypto from "crypto";

export const SESSION_COOKIE_NAME = "admin_session";
export const SESSION_DURATION_SECONDS = 12 * 60 * 60; // 12 hours

interface SessionPayload {
  role: "admin";
  exp: number; // Unix timestamp in seconds
}

function scryptPromise(
  password: crypto.BinaryLike,
  salt: crypto.BinaryLike,
  keylen: number,
  options: crypto.ScryptOptions
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, keylen, options, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey as Buffer);
    });
  });
}

/**
 * Validates a plaintext password against the stored salt:hash format.
 * Format expected: <salt_hex>:<hash_hex>
 */
export async function verifyPassword(password: string): Promise<boolean> {
  let storedHashConfig = process.env.ADMIN_PASSWORD_HASH;
  if (!storedHashConfig) {
    throw new Error(
      "Admin authentication is not configured: ADMIN_PASSWORD_HASH is missing."
    );
  }

  // Strip accidental redundant prefix, trailing whitespace, or quotes
  storedHashConfig = storedHashConfig.trim().replace(/^["']|["']$/g, "");
  if (storedHashConfig.startsWith("ADMIN_PASSWORD_HASH=")) {
    storedHashConfig = storedHashConfig.slice("ADMIN_PASSWORD_HASH=".length).trim();
  }
  if (storedHashConfig.startsWith("ADMIN_PASSWORD_HASH:")) {
    storedHashConfig = storedHashConfig.slice("ADMIN_PASSWORD_HASH:".length).trim();
  }

  const parts = storedHashConfig.split(":");
  if (parts.length !== 2) {
    throw new Error(
      "Admin authentication is not configured: ADMIN_PASSWORD_HASH format must be <salt_hex>:<hash_hex>."
    );
  }

  const saltHex = parts[0].trim();
  const expectedHashHex = parts[1].trim();

  if (saltHex.length !== 32 || expectedHashHex.length !== 128) {
    throw new Error(
      "Admin authentication is not configured: invalid salt or hash key length."
    );
  }

  try {
    const salt = Buffer.from(saltHex, "hex");
    const expectedHash = Buffer.from(expectedHashHex, "hex");

    const derivedKey = await scryptPromise(password, salt, 64, {
      N: 32768,
      r: 8,
      p: 1,
      maxmem: 64 * 1024 * 1024,
    });

    if (derivedKey.length !== expectedHash.length) {
      return false;
    }

    return crypto.timingSafeEqual(derivedKey, expectedHash);
  } catch {
    return false;
  }
}

/**
 * Creates a signed 12-hour HMAC-SHA256 session token.
 */
export function createSessionToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "Admin authentication is not configured. Missing or insecure session secret."
    );
  }

  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload: SessionPayload = { role: "admin", exp };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("hex");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 signed session token.
 */
export function verifySessionToken(token: string | undefined): boolean {
  if (!token || typeof token !== "string") {
    return false;
  }

  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [payloadB64, signature] = parts;
  if (!payloadB64 || !signature) {
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("hex");

    const sigBuf = Buffer.from(signature, "hex");
    const expSigBuf = Buffer.from(expectedSignature, "hex");

    if (sigBuf.length !== expSigBuf.length) {
      return false;
    }

    if (!crypto.timingSafeEqual(sigBuf, expSigBuf)) {
      return false;
    }

    const payloadJson = Buffer.from(payloadB64, "base64url").toString("utf8");
    const payload = JSON.parse(payloadJson) as SessionPayload;

    if (payload.role !== "admin") {
      return false;
    }

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || payload.exp <= now) {
      return false; // Expired
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Server-side session verification helper for React components and API routes.
 */
export async function verifyAdminSession(): Promise<{ isAuthenticated: boolean }> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) {
      return { isAuthenticated: false };
    }

    const isValid = verifySessionToken(sessionCookie.value);
    return { isAuthenticated: isValid };
  } catch {
    return { isAuthenticated: false };
  }
}

/**
 * Enforces strict CSRF origin verification on state-changing requests (POST, PUT, DELETE).
 * Rejects when Origin header is missing or does not match Host or NEXT_PUBLIC_SITE_URL.
 * No Referer fallback.
 */
export function verifyCsrfOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) {
    return false; // Strictly reject when Origin is missing
  }

  const host = request.headers.get("host"); // e.g. "localhost:3000" or preview host
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  try {
    const originUrl = new URL(origin);

    // Allow if origin host matches the incoming Host header
    if (host && originUrl.host === host) {
      return true;
    }

    // Allow if origin matches configured NEXT_PUBLIC_SITE_URL
    if (siteUrl && origin === new URL(siteUrl).origin) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}
