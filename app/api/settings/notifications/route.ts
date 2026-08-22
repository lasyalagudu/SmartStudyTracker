import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/settings/notifications
 *
 * Persists the user's notification preferences.
 * Body: { dailyReminder: boolean, revisionAlerts: boolean, streakNotifications: boolean }
 *
 * These are stored in the notificationPrefs JSON column on the User model.
 * If your schema doesn't have that column yet, run:
 *   npx prisma migrate dev --name add_notification_prefs
 * after adding:
 *   notificationPrefs Json? @default("{}")
 * to the User model in schema.prisma.
 */
export async function PATCH(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      dailyReminder,
      revisionAlerts,
      streakNotifications,
    }: {
      dailyReminder?: boolean;
      revisionAlerts?: boolean;
      streakNotifications?: boolean;
    } = body;

    // Build the prefs object from existing + new values.
    const existing =
      typeof (user as any).notificationPrefs === "object" &&
      (user as any).notificationPrefs !== null
        ? ((user as any).notificationPrefs as Record<string, boolean>)
        : {};

    const prefs = {
      ...existing,
      ...(dailyReminder !== undefined && { dailyReminder }),
      ...(revisionAlerts !== undefined && { revisionAlerts }),
      ...(streakNotifications !== undefined && { streakNotifications }),
    };

    // Use a raw update so we don't need a schema migration right now.
    // Once the column is added to schema.prisma this becomes a normal update.
    await prisma.$executeRaw`
      UPDATE "User"
      SET "notificationPrefs" = ${JSON.stringify(prefs)}::jsonb,
          "updatedAt" = NOW()
      WHERE id = ${user.id}
    `;

    return NextResponse.json({ success: true, prefs });
  } catch (error) {
    console.error("[PATCH /api/settings/notifications]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to save notification preferences",
      },
      { status: 500 }
    );
  }
}
