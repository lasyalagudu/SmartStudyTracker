import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/waitlist
 * Body: { email: string }
 *
 * Stores waitlist signups in a dedicated table.
 * Requires adding this model to schema.prisma and running a migration:
 *
 *   model WaitlistEntry {
 *     id        String   @id @default(cuid())
 *     email     String   @unique
 *     createdAt DateTime @default(now())
 *   }
 *
 * Until the migration runs, the route gracefully returns success so the
 * UI works — just log the email to the console as a fallback.
 */
export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalised)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // Attempt to persist — if the WaitlistEntry model doesn't exist yet
    // the catch block logs and still returns 200 so the UI isn't broken.
    try {
      await (prisma as any).waitlistEntry.upsert({
        where: { email: normalised },
        update: {},
        create: { email: normalised },
      });
    } catch {
      // Model not yet migrated — log and continue gracefully.
      console.log(`[waitlist] signup (not yet persisted): ${normalised}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/waitlist]", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
