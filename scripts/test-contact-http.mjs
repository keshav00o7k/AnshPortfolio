import { NextRequest } from "next/server.js";
import { POST } from "../app/api/contact/route.ts";
import { getResendBaseUrl } from "../lib/contact-server.ts";

let passed = 0;
let failed = 0;

function logTest(num, name, ok, details = "") {
  if (ok) {
    passed++;
    console.log(`  [PASS] Test ${num}: ${name}${details ? ` -> ${details}` : ""}`);
  } else {
    failed++;
    console.error(`  [FAIL] Test ${num}: ${name}${details ? ` -> ${details}` : ""}`);
  }
}

async function runTests() {
  console.log("========================================================");
  console.log("       CONTACT API COMPREHENSIVE INTEGRATION TESTS      ");
  console.log("========================================================\n");

  const HOST = "localhost:3000";
  const VALID_ORIGIN = "http://localhost:3000";

  // Mock state for Resend API calls
  let resendDispatchedCalls = [];
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (url, options) => {
    const urlStr = String(url);
    if (urlStr.includes("resend.com") || urlStr.includes("127.0.0.1:4005") || urlStr.includes("localhost:4005")) {
      const parsedBody = options?.body ? JSON.parse(options.body) : {};
      resendDispatchedCalls.push({
        url: urlStr,
        headers: options?.headers,
        body: parsedBody,
      });

      return new Response(JSON.stringify({ id: "mock_email_msg_id_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return originalFetch(url, options);
  };

  // Helper to construct a NextRequest for POST /api/contact
  function makeRequest({
    origin = VALID_ORIGIN,
    host = HOST,
    ip = "192.168.1.1",
    body = {},
  }) {
    const headers = new Headers();
    if (origin) headers.set("origin", origin);
    if (host) headers.set("host", host);
    if (ip) headers.set("x-forwarded-for", ip);
    headers.set("content-type", "application/json");

    return new NextRequest(`http://${host}/api/contact`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  }

  // Setup valid environment for baseline tests
  process.env.RESEND_API_KEY = "re_mock_test_key";
  process.env.CONTACT_EMAIL = "owner@test.com";
  process.env.CONTACT_FROM = "onboarding@resend.dev";

  try {
    // 1. Non-local Resend override is strictly ignored
    {
      process.env.RESEND_BASE_URL_OVERRIDE = "https://evil-attacker-site.com/api";
      const resolved = getResendBaseUrl();
      const ok = resolved === "https://api.resend.com";
      logTest(1, "Non-local RESEND_BASE_URL_OVERRIDE is strictly ignored", ok, `Resolved: ${resolved}`);
    }

    // 2. Localhost Resend override is accepted for local mocks
    {
      process.env.RESEND_BASE_URL_OVERRIDE = "http://127.0.0.1:4005";
      const resolved = getResendBaseUrl();
      const ok = resolved === "http://127.0.0.1:4005";
      logTest(2, "Localhost/127.0.0.1 RESEND_BASE_URL_OVERRIDE is accepted", ok, `Resolved: ${resolved}`);
    }

    // 3. Missing Origin -> 403 Forbidden
    {
      const req = makeRequest({ origin: null, ip: "10.0.1.1", body: { name: "Test" } });
      const res = await POST(req);
      const ok = res.status === 403;
      logTest(3, "Missing Origin returns 403 Forbidden", ok, `Status ${res.status}`);
    }

    // 4. Cross-origin -> 403 Forbidden
    {
      const req = makeRequest({
        origin: "https://malicious-external-site.com",
        ip: "10.0.1.2",
        body: { name: "Test" },
      });
      const res = await POST(req);
      const ok = res.status === 403;
      logTest(4, "Cross-origin Origin returns 403 Forbidden", ok, `Status ${res.status}`);
    }

    // 5. Honeypot filled -> 200 OK returned silently, 0 emails dispatched
    {
      resendDispatchedCalls = [];
      const req = makeRequest({
        ip: "10.0.1.3",
        body: {
          name: "Bot Name",
          email: "bot@spam.com",
          projectType: "Ads",
          message: "Buy cheap crypto now!",
          contact_lead_ref: "https://bot-spam.ru", // Honeypot filled
        },
      });
      const res = await POST(req);
      const data = await res.json();
      const ok = res.status === 200 && data.success === true && resendDispatchedCalls.length === 0;
      logTest(5, "Honeypot filled returns 200 silently with 0 emails sent", ok, 
        `Status ${res.status}, Resend calls: ${resendDispatchedCalls.length}`);
    }

    // 6. Rate limit: 3 allowed, 4th request from same IP returns 429
    {
      const testIp = "10.0.2.99";
      let allFirstThreeOk = true;
      for (let i = 1; i <= 3; i++) {
        const req = makeRequest({
          ip: testIp,
          body: {
            name: `User ${i}`,
            email: `user${i}@example.com`,
            projectType: "YouTube long-form",
            message: `This is legitimate message number ${i} for testing.`,
          },
        });
        const res = await POST(req);
        if (res.status !== 200) allFirstThreeOk = false;
      }

      // 4th request should be rate-limited
      const req4 = makeRequest({
        ip: testIp,
        body: {
          name: "User 4",
          email: "user4@example.com",
          projectType: "YouTube long-form",
          message: "This 4th message exceeds the window threshold.",
        },
      });
      const res4 = await POST(req4);
      const data4 = await res4.json();
      const ok = allFirstThreeOk && res4.status === 429 && data4.error?.includes("Too many requests");
      logTest(6, "Rate limit returns 429 on 4th request from same IP", ok, 
        `First 3 ok: ${allFirstThreeOk}, 4th status: ${res4.status}`);
    }

    // 7. Different IP succeeds immediately (proves per-IP rate limit isolation)
    {
      const req = makeRequest({
        ip: "10.0.3.1", // Fresh IP
        body: {
          name: "Independent User",
          email: "independent@example.com",
          projectType: "Shorts and reels",
          message: "A fresh client message from an unblocked IP address.",
        },
      });
      const res = await POST(req);
      const ok = res.status === 200;
      logTest(7, "Different IP is not blocked by previous IP rate limit", ok, `Status ${res.status}`);
    }

    // 8. Unknown field rejected (including budget) -> 400
    {
      const req = makeRequest({
        ip: "10.0.4.1",
        body: {
          name: "Client",
          email: "client@example.com",
          projectType: "Ads",
          message: "Legitimate message text for budget rejection test.",
          budget: "$1500", // Forbidden field
        },
      });
      const res = await POST(req);
      const data = await res.json();
      const ok = res.status === 400 && data.error?.includes("Unknown field: budget");
      logTest(8, "Unknown field 'budget' rejected with 400", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // 9. Name with newlines or control characters -> 400 (rejected, not silently stripped)
    {
      const req = makeRequest({
        ip: "10.0.4.2",
        body: {
          name: "John\r\nDoe", // CRLF newline injection
          email: "john@example.com",
          projectType: "Ads",
          message: "Legitimate message text testing name newline rejection.",
        },
      });
      const res = await POST(req);
      const data = await res.json();
      const ok = res.status === 400 && data.error?.includes("control characters or newlines");
      logTest(9, "Name containing newline rejected with 400", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // 10. Reply-to email with comma rejected -> 400
    {
      const req = makeRequest({
        ip: "10.0.4.3",
        body: {
          name: "John Doe",
          email: "first@example.com,second@example.com", // Multi-address delimiter injection
          projectType: "Ads",
          message: "Legitimate message text testing email comma rejection.",
        },
      });
      const res = await POST(req);
      const data = await res.json();
      const ok = res.status === 400 && data.error?.includes("invalid characters or delimiters");
      logTest(10, "Email address containing comma rejected with 400", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // 11. Email with quotes rejected -> 400
    {
      const req = makeRequest({
        ip: "10.0.4.4",
        body: {
          name: "John Doe",
          email: '"quoted"@example.com',
          projectType: "Ads",
          message: "Legitimate message text testing quote rejection in email.",
        },
      });
      const res = await POST(req);
      const data = await res.json();
      const ok = res.status === 400 && data.error?.includes("invalid characters or delimiters");
      logTest(11, "Email address containing quotes rejected with 400", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // 12. Oversized message (> 1000 characters) -> 400
    {
      const oversizedText = "A".repeat(1005);
      const req = makeRequest({
        ip: "10.0.4.5",
        body: {
          name: "John Doe",
          email: "john@example.com",
          projectType: "Ads",
          message: oversizedText,
        },
      });
      const res = await POST(req);
      const data = await res.json();
      const ok = res.status === 400 && data.error?.includes("1000 characters");
      logTest(12, "Message exceeding 1000 characters rejected with 400", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // 13. Message under 10 characters -> 400
    {
      const req = makeRequest({
        ip: "10.0.4.6",
        body: {
          name: "John Doe",
          email: "john@example.com",
          projectType: "Ads",
          message: "Hi",
        },
      });
      const res = await POST(req);
      const data = await res.json();
      const ok = res.status === 400 && data.error?.includes("10");
      logTest(13, "Message under 10 characters rejected with 400", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // 14. Invalid project type not in whitelist -> 400
    {
      const req = makeRequest({
        ip: "10.0.4.7",
        body: {
          name: "John Doe",
          email: "john@example.com",
          projectType: "Unapproved Custom Type",
          message: "Testing project type whitelist enforcement.",
        },
      });
      const res = await POST(req);
      const data = await res.json();
      const ok = res.status === 400 && data.error?.includes("valid project type");
      logTest(14, "Invalid project type rejected with 400", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

    // 15. Missing server environment returns generic 500 without printing values
    {
      const originalKey = process.env.RESEND_API_KEY;
      delete process.env.RESEND_API_KEY;

      const req = makeRequest({
        ip: "10.0.4.8",
        body: {
          name: "John Doe",
          email: "john@example.com",
          projectType: "Wedding",
          message: "Testing missing environment handling in contact route.",
        },
      });
      const res = await POST(req);
      const data = await res.json();
      const ok = res.status === 500 && data.error === "Contact service is temporarily unavailable.";
      logTest(15, "Missing server env returns generic 500 without leaking secrets", ok, 
        `Status ${res.status}, Error: "${data.error}"`);

      // Restore key
      process.env.RESEND_API_KEY = originalKey;
    }

    // 16. Valid submission -> 200 OK and verified Resend payload structure
    {
      resendDispatchedCalls = [];
      const req = makeRequest({
        ip: "10.0.4.9",
        body: {
          name: "Ansh Client",
          email: "client@studio.com",
          projectType: "YouTube long-form",
          message: "Hello! We would love to hire you to edit our weekly YouTube documentaries.",
        },
      });
      const res = await POST(req);
      const data = await res.json();
      const lastCall = resendDispatchedCalls[0];

      const ok =
        res.status === 200 &&
        data.success === true &&
        lastCall &&
        lastCall.body.reply_to === "client@studio.com" &&
        lastCall.body.to[0] === "owner@test.com" &&
        lastCall.body.subject === "[Project Inquiry] YouTube long-form - Ansh Client" &&
        typeof lastCall.body.text === "string" &&
        lastCall.body.text.includes("Ansh Client") &&
        !lastCall.body.html; // Plain text only, no HTML

      logTest(16, "Valid submit returns 200 with verified Resend payload (plain text, reply_to, subject)", ok,
        `Status ${res.status}, Reply-to: ${lastCall?.body.reply_to}, Subject: "${lastCall?.body.subject}"`);
    }

    // 17. Valid submission WITH mobile phone number -> 200 OK and phone included in email
    {
      resendDispatchedCalls = [];
      const req = makeRequest({
        ip: "10.0.4.10",
        body: {
          name: "Ansh Client",
          email: "client@studio.com",
          phone: "+91 98765 43210",
          projectType: "Shorts and reels",
          message: "Hello! Inquiry including verified client WhatsApp mobile number.",
        },
      });
      const res = await POST(req);
      const data = await res.json();
      const lastCall = resendDispatchedCalls[0];

      const ok =
        res.status === 200 &&
        data.success === true &&
        lastCall &&
        typeof lastCall.body.text === "string" &&
        lastCall.body.text.includes("+91 98765 43210");

      logTest(17, "Valid submit with mobile phone includes phone in email body", ok,
        `Status ${res.status}, Email body includes phone: ${ok}`);
    }

    // 18. Invalid phone number (letters or invalid chars) -> 400
    {
      const req = makeRequest({
        ip: "10.0.4.11",
        body: {
          name: "John Doe",
          email: "john@example.com",
          phone: "not-a-valid-phone-1234",
          projectType: "Ads",
          message: "Testing phone format rejection with invalid characters.",
        },
      });
      const res = await POST(req);
      const data = await res.json();
      const ok = res.status === 400 && data.error?.includes("valid phone number");
      logTest(18, "Invalid phone number rejected with 400", ok, `Status ${res.status}, Error: "${data.error}"`);
    }

  } finally {
    // Restore fetch
    globalThis.fetch = originalFetch;
  }

  console.log("\n========================================================");
  console.log(`TOTAL PASSED: ${passed} / ${passed + failed}`);
  console.log("========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
