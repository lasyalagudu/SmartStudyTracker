/**
 * scripts/push-schema.js
 * Loads .env.local (where DIRECT_URL lives) then runs prisma db push.
 * Usage: node scripts/push-schema.js
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Parse a simple KEY="VALUE" or KEY=VALUE .env file
function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  const out = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const root = path.resolve(__dirname, "..");
const envLocal = parseEnv(path.join(root, ".env.local"));
const envBase  = parseEnv(path.join(root, ".env"));

// Merge: .env.local overrides .env
const env = { ...process.env, ...envBase, ...envLocal };

console.log("→ DATABASE_URL:", env.DATABASE_URL ? env.DATABASE_URL.slice(0, 40) + "…" : "MISSING");
console.log("→ DIRECT_URL:  ", env.DIRECT_URL   ? env.DIRECT_URL.slice(0, 40) + "…" : "MISSING");

if (!env.DIRECT_URL) {
  console.error("ERROR: DIRECT_URL not found in .env or .env.local");
  process.exit(1);
}

const prismaBin = path.join(root, "node_modules", "prisma", "build", "index.js");
console.log("\n→ Running prisma db push…\n");

// For db push on Supabase, use DIRECT_URL for both connections to avoid
// pgbouncer transaction-mode issues and cross-schema FK introspection errors.
const pushEnv = {
  ...env,
  DATABASE_URL: env.DIRECT_URL,  // use direct (non-pooled) for the push
};

try {
  execSync(`node "${prismaBin}" db push`, {
    env: pushEnv,
    cwd: root,
    stdio: "inherit",
  });
  console.log("\n✅  db push complete.");
} catch (e) {
  console.error("\n❌  db push failed:", e.message);
  process.exit(1);
}
