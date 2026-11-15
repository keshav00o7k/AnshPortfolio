import crypto from "crypto";
import readline from "readline";

/**
 * Interactive password hasher script for Antigravity Admin.
 * - Reads password through masked/hidden prompt (never CLI args).
 * - Derives scrypt key using N=32768, r=8, p=1, keylen=64.
 * - Output format: <salt_hex>:<hash_hex> (no '$' character to prevent Next.js env expansion issues).
 * - Never logs or stores password to disk.
 */

function askHidden(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const stdin = process.stdin;
    process.stdout.write(query);

    let password = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    const onData = (char) => {
      if (char === "\n" || char === "\r" || char === "\u0004") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        rl.close();
        process.stdout.write("\n");
        resolve(password);
      } else if (char === "\u0003") {
        // Ctrl+C
        process.stdout.write("\n");
        process.exit(1);
      } else if (char === "\b" || char === "\x7f") {
        // Backspace
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write("\b \b");
        }
      } else {
        password += char;
        process.stdout.write("*");
      }
    };

    stdin.on("data", onData);
  });
}

async function main() {
  console.log("==========================================");
  console.log("  ANSH PORTFOLIO - ADMIN PASSWORD HASHER  ");
  console.log("==========================================\n");

  const password = await askHidden("Enter desired admin password: ");
  const trimmed = password.trim();

  if (!trimmed || trimmed.length < 8) {
    console.error("\nError: Password must be at least 8 characters long.");
    process.exit(1);
  }

  const salt = crypto.randomBytes(16);
  crypto.scrypt(
    trimmed,
    salt,
    64,
    { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 },
    (err, derivedKey) => {
      if (err) {
        console.error("\nHashing error:", err);
        process.exit(1);
      }

      const saltHex = salt.toString("hex");
      const hashHex = derivedKey.toString("hex");
      const formatted = `${saltHex}:${hashHex}`;

      console.log("\nGenerated hash (copy the value below to ADMIN_PASSWORD_HASH in .env.local):");
      console.log(formatted);
      console.log("\nRemember: Keep .env.local private and never commit it to git.\n");
    }
  );
}

main();

