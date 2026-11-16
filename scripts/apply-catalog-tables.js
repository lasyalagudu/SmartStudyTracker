/**
 * scripts/apply-catalog-tables.js
 *
 * Uses `prisma db execute` to run catalog-tables.sql directly against the DB,
 * bypassing the introspection step that fails on Supabase (P4002 / auth.users FK).
 *
 * Usage: node scripts/apply-catalog-tables.js
 */

const fs   = require("fs");
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

const root     = path.resolve(__dirname, "..");
const envBase  = parseEnv(path.join(root, ".env"));
const envLocal = parseEnv(path.join(root, ".env.local"));
const env      = { ...process.env, ...envBase, ...envLocal };

// Use DIRECT_URL for DDL — pgbouncer transaction mode doesn't support DDL
env.DATABASE_URL = env.DIRECT_URL;

console.log("→ DATABASE_URL (direct):", env.DATABASE_URL.slice(0, 50) + "…");

const prismaBin = path.join(root, "node_modules", "prisma", "build", "index.js");
const sqlFile   = path.join(root, "scripts", "catalog-tables.sql");

console.log("\n→ Running prisma db execute with catalog-tables.sql…\n");

try {
  execSync(
    `node "${prismaBin}" db execute --stdin --schema="${path.join(root, "prisma", "schema.prisma")}" < "${sqlFile}"`,
    { env, cwd: root, stdio: "inherit", shell: true }
  );
  console.log("\n✅  Catalog tables created successfully.");
  console.log("   • ExamCatalog");
  console.log("   • CatalogSubject");
  console.log("   • CatalogTopic");
} catch (e) {
  console.error("\n❌  Failed:", e.message);
  process.exit(1);
}
