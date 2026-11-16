/**
 * scripts/seed-db.js
 * Loads .env.local then runs the prisma seed (ts-node prisma/seed.ts).
 * Usage: node scripts/seed-db.js
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

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
const env  = { ...process.env, ...parseEnv(path.join(root, ".env")), ...parseEnv(path.join(root, ".env.local")) };

console.log("→ DATABASE_URL:", env.DATABASE_URL ? env.DATABASE_URL.slice(0, 40) + "…" : "MISSING");
console.log("→ DIRECT_URL:  ", env.DIRECT_URL   ? env.DIRECT_URL.slice(0, 40)   + "…" : "MISSING");

const tsNode = path.join(root, "node_modules", ".bin", "ts-node.cmd");
const seedFile = path.join(root, "prisma", "seed.ts");
const tsconfigSeed = path.join(root, "prisma", "tsconfig.seed.json");

console.log("\n→ Running seed…\n");

try {
  execSync(
    `"${tsNode}" --project "${tsconfigSeed}" "${seedFile}"`,
    { env, cwd: root, stdio: "inherit" }
  );
  console.log("\n✅  Seed complete.");
} catch (e) {
  console.error("\n❌  Seed failed:", e.message);
  process.exit(1);
}
