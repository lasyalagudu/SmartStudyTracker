/**
 * scripts/seedCatalog.ts
 *
 * Seeds the ExamCatalog table from the curated examTemplates.ts data.
 * Run once after your first migration:
 *
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seedCatalog.ts
 *
 * Or add to package.json:
 *   "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} scripts/seedCatalog.ts"
 *
 * Safe to re-run — uses upsert so existing entries are updated, not duplicated.
 */

import { PrismaClient } from "@prisma/client";
import { EXAM_TEMPLATES } from "../lib/examTemplates";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ExamCatalog...\n");

  for (const [key, template] of Object.entries(EXAM_TEMPLATES)) {
    const slug = key; // e.g. "GATE", "JEE", "NEET"

    // Upsert the catalog header
    const catalog = await prisma.examCatalog.upsert({
      where: { slug },
      update: {
        label: template.label,
        description: template.description,
        totalHours: template.totalHours,
        isActive: true,
      },
      create: {
        slug,
        label: template.label,
        description: template.description,
        icon: "📚",
        totalHours: template.totalHours,
        isActive: true,
      },
    });

    // Delete existing subjects for a clean re-seed
    await prisma.catalogSubject.deleteMany({
      where: { examId: catalog.id },
    });

    // Re-create subjects + topics
    for (let si = 0; si < template.subjects.length; si++) {
      const s = template.subjects[si];

      const subject = await prisma.catalogSubject.create({
        data: {
          examId: catalog.id,
          name: s.name,
          color: s.color,
          order: si,
        },
      });

      await prisma.catalogTopic.createMany({
        data: s.topics.map((t, ti) => ({
          subjectId: subject.id,
          name: t.name,
          estimatedHours: t.estimatedHours,
          priority: t.priority,
          difficulty: t.difficulty,
          order: ti,
        })),
      });
    }

    const topicCount = template.subjects.reduce((n, s) => n + s.topics.length, 0);
    console.log(
      `✓ ${template.label.padEnd(20)} — ${template.subjects.length} subjects, ${topicCount} topics, ${template.totalHours}h`
    );
  }

  console.log("\nDone — catalog seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
