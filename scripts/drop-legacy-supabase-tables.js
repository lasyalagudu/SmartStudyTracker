/**
 * scripts/drop-legacy-supabase-tables.js
 *
 * Drops the old Supabase-Auth-era snake_case tables and trigger that cause
 * the P4002 "Cross schema references" error in `prisma db push`.
 *
 * Usage: node scripts/drop-legacy-supabase-tables.js
 */
const fs   = require("fs");
const path = require("path");
const { execSync } = require("child_process");

function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const out = {};
  for (const line of fs.readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
      val = val.slice(1, -1);
    out[key] = val;
  }
  return out;
}

const root   = path.resolve(__dirname, "..");
const env    = { ...process.env, ...parseEnv(path.join(root, ".env")), ...parseEnv(path.join(root, ".env.local")) };
env.DATABASE_URL = env.DIRECT_URL;

const prisma = path.join(root, "node_modules", "prisma", "build", "index.js");
const sql    = path.join(root, "scripts", "drop-legacy-supabase-tables.sql");
const schema = path.join(root, "prisma", "schema.prisma");

console.log("→ Dropping legacy Supabase-Auth tables…");
console.log("→ DB:", env.DATABASE_URL.slice(0, 50) + "…\n");

try {
  execSync(`node "${prisma}" db execute --stdin --schema="${schema}" < "${sql}"`,
    { env, cwd: root, stdio: "inherit", shell: true });
  console.log("\n✅  Legacy tables dropped. You can now run: npx prisma db push");
} catch (e) {
  console.error("\n❌  Failed:", e.message);
  process.exit(1);
}
