/**
 * scripts/add-mentor-signup-intent.js
 * Adds the mentorSignupIntent column to the User table.
 * Safe to re-run — uses IF NOT EXISTS via ALTER TABLE … ADD COLUMN IF NOT EXISTS.
 */
const path = require("path");
const { execSync } = require("child_process");
const fs = require("fs");

function parseEnv(f) {
  if (!fs.existsSync(f)) return {};
  return Object.fromEntries(
    fs.readFileSync(f, "utf8").split("\n")
      .filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => {
        const eq = l.indexOf("=");
        let v = l.slice(eq + 1).trim();
        if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
        return [l.slice(0, eq).trim(), v];
      })
  );
}

const root = path.resolve(__dirname, "..");
const env  = { ...process.env, ...parseEnv(path.join(root, ".env")), ...parseEnv(path.join(root, ".env.local")) };
env.DATABASE_URL = env.DIRECT_URL;

const prisma  = path.join(root, "node_modules", "prisma", "build", "index.js");
const schema  = path.join(root, "prisma", "schema.prisma");
const sql     = `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "mentorSignupIntent" BOOLEAN NOT NULL DEFAULT false;`;

// Write temp SQL file
const tmpSql = path.join(root, "scripts", "_tmp_migration.sql");
fs.writeFileSync(tmpSql, sql);

console.log("→ Adding mentorSignupIntent column to User table…");
try {
  execSync(`node "${prisma}" db execute --stdin --schema="${schema}" < "${tmpSql}"`,
    { env, cwd: root, stdio: "inherit", shell: true });
  console.log("✅  Column added.");
} catch (e) {
  console.error("❌  Failed:", e.message);
  process.exit(1);
} finally {
  fs.unlinkSync(tmpSql);
}
