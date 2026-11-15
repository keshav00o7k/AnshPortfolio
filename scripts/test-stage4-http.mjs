/**
 * Stage 4 Real HTTP Integration Test Suite against a live Next.js production server.
 * 
 * Verifies:
 * 1. POST /api/admin/update without cookie -> 401
 * 2. POST /api/admin/update without Origin -> 403
 * 3. POST /api/admin/update with cross-origin -> 403
 * 4. POST /api/admin/update with tampered cookie -> 401
 * 5. POST /api/admin/update with malformed public_id -> 400
 * 6. POST /api/admin/update with unknown fields -> 400
 * 7. POST /api/admin/delete without cookie -> 401
 * 8. POST /api/admin/delete without Origin -> 403
 * 9. POST /api/admin/delete with bulk delete payload -> 400
 * 10. POST /api/admin/delete with unknown fields -> 400
 * 11. Context delimiter injection test: title containing '|' and '=' stripped cleanly
 * 12. Complete Real Lifecycle Test on Test Video:
 *     - Direct signed upload of test asset
 *     - Verification as draft (isolated from public listing)
 *     - Publish video via /api/admin/update and measure Search API indexing delay
 *     - Verify video appears on public site
 *     - Unpublish video via /api/admin/update and measure Search API indexing delay
 *     - Verify video disappears from public site
 *     - Delete video via /api/admin/delete
 *     - Confirm asset is completely purged from Cloudinary storage
 * 
 * SECURITY RULES:
 * - Never prints or logs any environment variable, secret, or key value.
 * - Never touches real client reels (e.g. reel-07_cymp0e).
 * - Leaves zero leftover test artifacts in Cloudinary.
 */

import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createSessionToken } from "../lib/admin-auth.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const TEST_PORT = 3008;
const BASE_URL = `http://localhost:${TEST_PORT}`;

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
      // server still starting
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
  console.log("   STAGE 4 REAL HTTP INTEGRATION TESTS (LIVE SERVER)   ");
  console.log("========================================================\n");

  console.log(`Starting Next.js server on port ${TEST_PORT}...`);
  const serverProcess = spawn("cmd.exe", ["/c", "npm", "run", "start", "--", "-p", String(TEST_PORT)], {
    cwd: rootDir,
    stdio: ["ignore", "pipe", "pipe"],
  });

  serverProcess.stdout.on("data", (d) => {
    const s = d.toString();
    if (s.includes("Error") || s.includes("error") || s.includes("fail") || s.includes("Update failed")) {
      console.log(`[SERVER STDOUT] ${s.trim()}`);
    }
  });
  serverProcess.stderr.on("data", (d) => {
    console.error(`[SERVER STDERR] ${d.toString().trim()}`);
  });

  const ready = await waitForServer(BASE_URL);
  if (!ready) {
    console.error("Server did not become ready within timeout.");
    serverProcess.kill();
    process.exit(1);
  }

  console.log("Test server is ready. Executing real HTTP requests...\n");

  const validToken = createSessionToken();
  const validCookie = `admin_session=${validToken}`;
  let testUploadedPublicId = null;

  try {
    // 1. update without cookie -> 401
    {
      const res = await fetch(`${BASE_URL}/api/admin/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Host": `localhost:${TEST_PORT}`,
          "Origin": BASE_URL,
        },
        body: JSON.stringify({ public_id: "reel-112233445566", title: "Test" }),
      });
      const ok = res.status === 401;
      logTest(1, "POST /api/admin/update without cookie rejected", ok, `Status ${res.status}`);
    }

    // 2. update without Origin -> 403
    {
      const res = await fetch(`${BASE_URL}/api/admin/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": validCookie,
          "Host": `localhost:${TEST_PORT}`,
        },
        body: JSON.stringify({ public_id: "reel-112233445566", title: "Test" }),
      });
      const ok = res.status === 403;
      logTest(2, "POST /api/admin/update without Origin header rejected", ok, `Status ${res.status}`);
    }

    // 3. update with cross-origin Origin -> 403
    {
      const res = await fetch(`${BASE_URL}/api/admin/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": validCookie,
          "Host": `localhost:${TEST_PORT}`,
          "Origin": "https://malicious-attacker.com",
        },
        body: JSON.stringify({ public_id: "reel-112233445566", title: "Test" }),
      });
      const ok = res.status === 403;
      logTest(3, "POST /api/admin/update with cross-origin rejected", ok, `Status ${res.status}`);
    }

    // 4. update with tampered cookie -> 401
    {
      const res = await fetch(`${BASE_URL}/api/admin/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": "admin_session=tampered.fake_payload.invalid_signature",
          "Host": `localhost:${TEST_PORT}`,
          "Origin": BASE_URL,
        },
        body: JSON.stringify({ public_id: "reel-112233445566", title: "Test" }),
      });
      const ok = res.status === 401;
      logTest(4, "POST /api/admin/update with tampered cookie rejected", ok, `Status ${res.status}`);
    }

    // 5. update with malformed public_id -> 400
    {
      const res = await fetch(`${BASE_URL}/api/admin/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": validCookie,
          "Host": `localhost:${TEST_PORT}`,
          "Origin": BASE_URL,
        },
        body: JSON.stringify({ public_id: "malicious_script_../escape", title: "Test" }),
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.status === 400;
      logTest(5, "POST /api/admin/update with malformed ID rejected", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // 6. update with unknown fields -> 400
    {
      const res = await fetch(`${BASE_URL}/api/admin/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": validCookie,
          "Host": `localhost:${TEST_PORT}`,
          "Origin": BASE_URL,
        },
        body: JSON.stringify({
          public_id: "reel-112233445566",
          title: "Test",
          unauthorized_injected_field: "injected_val",
        }),
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.status === 400 && String(data.error).includes("Unknown field rejected");
      logTest(6, "POST /api/admin/update with unknown fields strictly rejected", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // 7. delete without cookie -> 401
    {
      const res = await fetch(`${BASE_URL}/api/admin/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Host": `localhost:${TEST_PORT}`,
          "Origin": BASE_URL,
        },
        body: JSON.stringify({ public_id: "reel-112233445566" }),
      });
      const ok = res.status === 401;
      logTest(7, "POST /api/admin/delete without cookie rejected", ok, `Status ${res.status}`);
    }

    // 8. delete without Origin -> 403
    {
      const res = await fetch(`${BASE_URL}/api/admin/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": validCookie,
          "Host": `localhost:${TEST_PORT}`,
        },
        body: JSON.stringify({ public_id: "reel-112233445566" }),
      });
      const ok = res.status === 403;
      logTest(8, "POST /api/admin/delete without Origin header rejected", ok, `Status ${res.status}`);
    }

    // 9. delete with bulk delete array payload -> 400
    {
      const res = await fetch(`${BASE_URL}/api/admin/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": validCookie,
          "Host": `localhost:${TEST_PORT}`,
          "Origin": BASE_URL,
        },
        body: JSON.stringify({ public_ids: ["reel-112233445566", "reel-223344556677"] }),
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.status === 400 && String(data.error).includes("Bulk deletion is disabled");
      logTest(9, "POST /api/admin/delete with bulk delete array payload rejected", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // 10. delete with unknown fields -> 400
    {
      const res = await fetch(`${BASE_URL}/api/admin/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cookie": validCookie,
          "Host": `localhost:${TEST_PORT}`,
          "Origin": BASE_URL,
        },
        body: JSON.stringify({ public_id: "reel-112233445566", force: true }),
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.status === 400 && String(data.error).includes("Unknown field rejected");
      logTest(10, "POST /api/admin/delete with unknown fields rejected", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // =========================================================================
    // 11 & 12: REAL LIFECYCLE TEST ON DEDICATED TEST ASSET
    // =========================================================================
    console.log("\n--- Starting Real Video Lifecycle Test ---");

    // Step A: Request signed upload payload from server
    console.log("  Step A: Requesting signed upload authorization...");
    const signRes = await fetch(`${BASE_URL}/api/admin/sign-upload`, {
      method: "POST",
      headers: {
        "Cookie": validCookie,
        "Host": `localhost:${TEST_PORT}`,
        "Origin": BASE_URL,
      },
    });
    if (!signRes.ok) throw new Error(`Sign upload failed with status ${signRes.status}`);
    const signData = await signRes.json();
    testUploadedPublicId = signData.public_id;
    console.log(`  Target test public ID: ${testUploadedPublicId}`);

    // Step B: Upload a small valid video to Cloudinary using signed parameters
    console.log("  Step B: Uploading test video to Cloudinary...");
    const sampleVideoPath = path.join(rootDir, "public", "videos", "reel-01.mp4");
    const videoBuffer = fs.readFileSync(sampleVideoPath);
    const videoBlob = new Blob([videoBuffer], { type: "video/mp4" });

    const form = new FormData();
    form.append("file", videoBlob, "test-reel.mp4");
    form.append("api_key", signData.api_key);
    form.append("timestamp", String(signData.timestamp));
    form.append("signature", signData.signature);
    form.append("public_id", signData.public_id);
    form.append("asset_folder", signData.asset_folder);

    const cloudUploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${signData.cloud_name}/video/upload`,
      { method: "POST", body: form }
    );
    if (!cloudUploadRes.ok) {
      const err = await cloudUploadRes.text();
      throw new Error(`Direct Cloudinary upload failed: ${err}`);
    }
    console.log("  Cloudinary upload successful.");

    // Step C: Verify upload integrity through verify-upload route
    console.log("  Step C: Running server verify-upload check...");
    const verifyRes = await fetch(`${BASE_URL}/api/admin/verify-upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": validCookie,
        "Host": `localhost:${TEST_PORT}`,
        "Origin": BASE_URL,
      },
      body: JSON.stringify({ public_id: testUploadedPublicId }),
    });
    const verifyData = await verifyRes.json().catch(() => ({}));
    const isVerifiedDraft = verifyRes.status === 200 && verifyData.success === true;
    logTest(11, "Verify uploaded test asset in Cloudinary folder as draft", isVerifiedDraft, `Status ${verifyRes.status}`);

    // Step D: Confirm test asset is isolated from public homepage
    {
      const homeRes = await fetch(BASE_URL);
      const homeHtml = await homeRes.text();
      const isAbsentFromHome = !homeHtml.includes(testUploadedPublicId);
      logTest(12, "Draft isolation verified: Draft test video NOT rendered on public homepage", isAbsentFromHome);
    }

    // Step E: Delimiter injection & publish test via /api/admin/update
    console.log("  Step E: Updating metadata with delimiter injection test & publishing...");
    const maliciousTitle = "Stage 4 Test Title | category=ad | order=9999 = injected";
    const updateRes = await fetch(`${BASE_URL}/api/admin/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": validCookie,
        "Host": `localhost:${TEST_PORT}`,
        "Origin": BASE_URL,
      },
      body: JSON.stringify({
        public_id: testUploadedPublicId,
        title: maliciousTitle,
        category: "film",
        order: 42,
        published: true,
      }),
    });
    const updateData = await updateRes.json().catch(() => ({}));
    if (!updateRes.ok) {
      console.log(`  [DEBUG] Update failed: Status ${updateRes.status}, Error:`, updateData);
    }
    const customCtx = updateData.context?.custom || updateData.context || {};
    // Verifying that '|' and '=' were stripped
    const isCleanTitle = customCtx.title === "Stage 4 Test Title  categoryad  order9999  injected";
    const hasPublishTag = updateData.tags?.includes("publish");
    const isUpdateSuccess = updateRes.status === 200 && isCleanTitle && hasPublishTag;
    logTest(
      13,
      "Metadata update sanitized delimiter injection and published video",
      isUpdateSuccess,
      `Sanitized title: "${customCtx.title}", Tags: [${updateData.tags?.join(", ")}]`
    );

    // Step F: Measure Cloudinary Search API indexing propagation delay
    console.log("  Step F: Measuring Cloudinary Search API indexing delay for publish...");
    const publishStart = Date.now();
    let publishedIndexSuccess = false;
    let publishIndexingSeconds = 0;
    while (Date.now() - publishStart < 35000) {
      await sleep(1500);
      const res = await fetch(BASE_URL, { headers: { "Cache-Control": "no-cache" } });
      const html = await res.text();
      if (html.includes(testUploadedPublicId)) {
        publishedIndexSuccess = true;
        publishIndexingSeconds = ((Date.now() - publishStart) / 1000).toFixed(1);
        break;
      }
    }
    logTest(
      14,
      `Search API index propagation on publish: Live site served video in ${publishIndexingSeconds}s`,
      publishedIndexSuccess,
      `Latency: ${publishIndexingSeconds}s`
    );

    // Step G: Unpublish the test video
    console.log("  Step G: Unpublishing test video via /api/admin/update...");
    const unpublishRes = await fetch(`${BASE_URL}/api/admin/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": validCookie,
        "Host": `localhost:${TEST_PORT}`,
        "Origin": BASE_URL,
      },
      body: JSON.stringify({
        public_id: testUploadedPublicId,
        published: false,
      }),
    });
    const unpublishData = await unpublishRes.json();
    const publishTagRemoved = !unpublishData.tags?.includes("publish");
    logTest(15, "Unpublish removes 'publish' tag from asset", unpublishRes.status === 200 && publishTagRemoved);

    // Step H: Measure Cloudinary Search API indexing propagation delay for unpublish
    console.log("  Step H: Measuring Cloudinary Search API indexing delay for unpublish...");
    const unpublishStart = Date.now();
    let unpublishIndexSuccess = false;
    let unpublishIndexingSeconds = 0;
    while (Date.now() - unpublishStart < 35000) {
      await sleep(1500);
      const res = await fetch(BASE_URL, { headers: { "Cache-Control": "no-cache" } });
      const html = await res.text();
      if (!html.includes(testUploadedPublicId)) {
        unpublishIndexSuccess = true;
        unpublishIndexingSeconds = ((Date.now() - unpublishStart) / 1000).toFixed(1);
        break;
      }
    }
    logTest(
      16,
      `Search API index propagation on unpublish: Live site removed video in ${unpublishIndexingSeconds}s`,
      unpublishIndexSuccess,
      `Latency: ${unpublishIndexingSeconds}s`
    );

    // Step I: Permanently delete the test video via /api/admin/delete
    console.log("  Step I: Deleting test video via /api/admin/delete...");
    const deleteRes = await fetch(`${BASE_URL}/api/admin/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": validCookie,
        "Host": `localhost:${TEST_PORT}`,
        "Origin": BASE_URL,
      },
      body: JSON.stringify({
        public_id: testUploadedPublicId,
      }),
    });
    const deleteData = await deleteRes.json();
    const isDeleted = deleteRes.status === 200 && deleteData.deleted === testUploadedPublicId;
    logTest(17, "Delete test asset permanently from Cloudinary", isDeleted, `Status ${deleteRes.status}`);

    // Step J: Confirm asset is purged from Cloudinary storage (Admin API 404)
    console.log("  Step J: Confirming asset is purged from Cloudinary upstream storage...");
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const checkEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/video/upload/${testUploadedPublicId}`;
    const checkRes = await fetch(checkEndpoint, {
      method: "GET",
      headers: { Authorization: `Basic ${basicAuth}` },
    });
    const isPurged = checkRes.status === 404;
    logTest(18, "Upstream storage check: Deleted asset returns 404 (purged completely)", isPurged, `Status ${checkRes.status}`);

    testUploadedPublicId = null; // Cleaned up!
  } finally {
    // Failsafe cleanup if test failed before deleting
    if (testUploadedPublicId) {
      console.log(`\nFailsafe cleanup: Purging ${testUploadedPublicId}...`);
      try {
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
        await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/resources/video/upload?public_ids[]=${testUploadedPublicId}&invalidate=true`, {
          method: "DELETE",
          headers: { Authorization: `Basic ${basicAuth}` },
        });
      } catch (cleanupErr) {
        console.error("Cleanup error:", cleanupErr);
      }
    }

    console.log("\nShutting down test server on port 3008...");
    spawn("taskkill", ["/pid", String(serverProcess.pid), "/f", "/t"]);
  }

  console.log("\n========================================================");
  console.log(`STAGE 4 REAL HTTP RESULTS: ${passed} passed, ${failed} failed`);
  console.log("========================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

run();

