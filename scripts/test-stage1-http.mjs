import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createSessionToken, verifyPassword } from "../lib/admin-auth.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const TEST_PORT = 3005;
const BASE_URL = `http://localhost:${TEST_PORT}`;

// Load environment variables for the test process
function loadEnvLocal() {
  const envPath = path.join(rootDir, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}
loadEnvLocal();

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(`${url}/admin/login`);
      if (res.status === 200 || res.status === 307) {
        return true;
      }
    } catch {
      // server still booting
    }
    await sleep(500);
  }
  return false;
}

let passed = 0;
let failed = 0;

function logTest(testNum, name, status, details = "") {
  if (status) {
    console.log(`  [PASS] Test ${testNum}: ${name}${details ? ` -> ${details}` : ""}`);
    passed++;
  } else {
    console.error(`  [FAIL] Test ${testNum}: ${name}${details ? ` -> ${details}` : ""}`);
    failed++;
  }
}

async function run() {
  console.log("\n========================================================");
  console.log("   STAGE 1 REAL HTTP INTEGRATION TESTS (LIVE SERVER)   ");
  console.log("========================================================\n");

  console.log(`Starting Next.js server on port ${TEST_PORT}...`);
  const serverProcess = spawn("cmd.exe", ["/c", "npm", "run", "start", "--", "-p", String(TEST_PORT)], {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"],
  });

  const ready = await waitForServer(BASE_URL);
  if (!ready) {
    console.error("Server did not become ready within timeout.");
    serverProcess.kill();
    process.exit(1);
  }

  console.log("Test server is ready. Executing real HTTP requests...\n");

  // Generate a valid signed session token using the server's session secret
  const validToken = createSessionToken();
  const validCookie = `admin_session=${validToken}`;

  try {
    // 1. GET /admin with no cookie -> 307 redirect to /admin/login
    {
      const res = await fetch(`${BASE_URL}/admin`, {
        method: "GET",
        redirect: "manual",
      });
      const location = res.headers.get("location");
      const ok = res.status === 307 && (location?.includes("/admin/login") ?? false);
      logTest(1, "GET /admin without cookie redirects", ok, `Status ${res.status}, Location: ${location}`);
    }

    // 2. POST /api/admin/auth/login with wrong password -> 401
    {
      const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Host": `localhost:${TEST_PORT}`,
          "Origin": BASE_URL,
        },
        body: JSON.stringify({ password: "arbitrary-wrong-password-999" }),
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.status === 401 && data.error === "Invalid credentials";
      logTest(2, "POST login with wrong password returns 401", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // 3. POST /api/admin/auth/login without Origin header -> 403 Forbidden
    {
      const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Host": `localhost:${TEST_PORT}`,
        },
        body: JSON.stringify({ password: "any-password" }),
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.status === 403;
      logTest(3, "POST login without Origin header returns 403", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // 4. POST /api/admin/auth/login with cross-origin Origin -> 403 Forbidden
    {
      const res = await fetch(`${BASE_URL}/api/admin/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Host": `localhost:${TEST_PORT}`,
          "Origin": "https://malicious-cross-origin.com",
        },
        body: JSON.stringify({ password: "any-password" }),
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.status === 403;
      logTest(4, "POST login with cross-origin Origin returns 403", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // 5. GET /admin with tampered cookie -> 307 redirect
    {
      const res = await fetch(`${BASE_URL}/admin`, {
        method: "GET",
        headers: {
          Cookie: "admin_session=eyJyb2xlIjoiYWRtaW4iLCJleHAiOjE5MDAwMDAwMDB9.invalidsignature123",
        },
        redirect: "manual",
      });
      const location = res.headers.get("location");
      const ok = res.status === 307 && (location?.includes("/admin/login") ?? false);
      logTest(5, "GET /admin with tampered cookie redirects", ok, `Status ${res.status}, Location: ${location}`);
    }

    // 6. GET /admin with expired cookie -> 307 redirect
    {
      const res = await fetch(`${BASE_URL}/admin`, {
        method: "GET",
        headers: {
          Cookie: "admin_session=eyJyb2xlIjoiYWRtaW4iLCJleHAiOjE2MDAwMDAwMDB9.expiredsig",
        },
        redirect: "manual",
      });
      const location = res.headers.get("location");
      const ok = res.status === 307 && (location?.includes("/admin/login") ?? false);
      logTest(6, "GET /admin with expired cookie redirects", ok, `Status ${res.status}, Location: ${location}`);
    }

    // 7. GET /api/admin/session-check without cookie -> 401 Unauthorized
    {
      const res = await fetch(`${BASE_URL}/api/admin/session-check`, {
        method: "GET",
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.status === 401 && data.authenticated === false;
      logTest(7, "GET /api/admin/session-check without cookie returns 401", ok, `Status ${res.status}`);
    }

    // 8. GET /api/admin/session-check with valid signed cookie -> 200 OK ({ authenticated: true, role: "admin" })
    {
      const res = await fetch(`${BASE_URL}/api/admin/session-check`, {
        method: "GET",
        headers: {
          Cookie: validCookie,
        },
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.status === 200 && data.authenticated === true && data.role === "admin";
      logTest(8, "GET /api/admin/session-check with valid cookie reaches /api/admin", ok, 
        `Status ${res.status}, Authenticated: ${data.authenticated}, Role: "${data.role}"`);
    }

    // 9. GET /admin with valid signed cookie -> 200 OK (passes admin gate)
    {
      const res = await fetch(`${BASE_URL}/admin`, {
        method: "GET",
        headers: {
          Cookie: validCookie,
        },
        redirect: "manual",
      });
      const ok = res.status === 200;
      logTest(9, "GET /admin with valid cookie returns 200 (access granted)", ok, `Status ${res.status}`);
    }

  } finally {
    console.log("\nShutting down test server...");
    spawn("taskkill", ["/pid", String(serverProcess.pid), "/f", "/t"]);
  }

  console.log("\n========================================================");
  console.log(`REAL HTTP RESULTS: ${passed} passed, ${failed} failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run();
