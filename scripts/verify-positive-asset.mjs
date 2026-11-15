import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { CLOUDINARY_FOLDER } from "../lib/cloudinary.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(rootDir, ".env.local");
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, "utf-8");
  const env = {};
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
      env[key] = val;
    }
  }
  return env;
}

const env = loadEnvLocal();
const cloudName = env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;

async function verifyPositive() {
  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Missing Cloudinary configuration in .env.local");
    process.exit(1);
  }

  const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;

  console.log("Querying Cloudinary Search API...");
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expression: `asset_folder="${CLOUDINARY_FOLDER}" AND tags=publish AND resource_type=video`,
      with_field: ["tags", "context"],
      sort_by: [{ created_at: "desc" }],
      max_results: 10,
    }),
  });

  if (!res.ok) {
    console.error(`Search API returned status ${res.status}: ${await res.text()}`);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`[Query 1: asset_folder="AnshPortfolio" AND tags=publish AND resource_type=video]`);
  console.log(`  total_count: ${data.total_count}`);
  console.log(`  resources_found: ${data.resources?.length || 0}`);

  // Query 2: broader check for tags=publish in case folder name differs
  const res2 = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expression: 'tags=publish AND resource_type=video',
      with_field: ["tags", "context"],
      max_results: 10,
    }),
  });
  const data2 = await res2.json();
  console.log(`[Query 2: tags=publish AND resource_type=video]`);
  console.log(`  total_count: ${data2.total_count}`);
  console.log(`  resources_found: ${data2.resources?.length || 0}`);

  // Query 3: check account total video assets
  const res3 = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      expression: 'resource_type:video',
      max_results: 10,
    }),
  });
  const data3 = await res3.json();
  console.log(`[Query 3: all account videos (resource_type:video)]`);
  console.log(`  total_count: ${data3.total_count}`);
  console.log(`  resources_found: ${data3.resources?.length || 0}`);

  // Check API Key media read permission diagnostic
  const usageRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/usage`, {
    headers: { Authorization: `Basic ${basicAuth}` },
  });
  if (usageRes.status === 403) {
    const usageData = await usageRes.json().catch(() => ({}));
    console.log(`\n[API Key Scope Diagnostic]`);
    console.log(`  Cloudinary usage endpoint returned: 403 Forbidden`);
    console.log(`  Message: ${usageData.error?.message || "Missing read permissions"}`);
  }

  const activeResources = data.resources?.length ? data.resources : (data2.resources?.length ? data2.resources : []);

  if (activeResources.length === 0) {
    console.log("\nNote: When Cloudinary API key has restricted scope without 'read' action permissions,");
    console.log("the Search API index total_count reflects matched records, but Cloudinary strips the resource objects from the response.");
    return;
  }

  const first = activeResources[0];
  console.log("\n--- First Published Asset Details ---");
  console.log(`public_id: ${first.public_id}`);
  console.log(`asset_folder: ${first.asset_folder || "(empty)"}`);
  console.log(`format: ${first.format}`);
  console.log(`resource_type: ${first.resource_type}`);
  console.log(`tags: ${JSON.stringify(first.tags)}`);
  console.log(`bytes: ${first.bytes}`);
  console.log(`context: ${JSON.stringify(first.context || {})}`);

  // Build the three URLs
  const previewUrl = `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto,c_limit,w_480,du_4,ac_none/${first.public_id}.mp4`;
  const fullUrl = `https://res.cloudinary.com/${cloudName}/video/upload/f_auto,q_auto,c_limit,w_1080/${first.public_id}.mp4`;
  const posterUrl = `https://res.cloudinary.com/${cloudName}/video/upload/so_0,f_auto,q_auto,c_limit,w_480/${first.public_id}.jpg`;

  console.log("\n--- Testing HTTP HEAD on Generated URLs ---");
  async function testHead(label, url) {
    try {
      const headRes = await fetch(url, { method: "HEAD" });
      console.log(`[${label}] Status: ${headRes.status}, Content-Type: ${headRes.headers.get("content-type")}, Content-Length: ${headRes.headers.get("content-length")}`);
      return headRes.status;
    } catch (err) {
      console.error(`[${label}] HEAD request failed: ${err.message}`);
      return 0;
    }
  }

  await testHead("Preview (du_4,ac_none)", previewUrl);
  await testHead("Full (w_1080)", fullUrl);
  await testHead("Poster (so_0, jpg)", posterUrl);
}

verifyPositive();
