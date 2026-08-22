import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/user/delete
 *
 * Permanently deletes the user's data from Postgres (cascades to exams,
 * subjects, topics, tasks, sessions, mistakes) then removes the Clerk
 * account so the email cannot be used to re-authenticate stale data.
 *
 * The client should sign the user out and redirect to "/" after a 200.
 */
export async function DELETE() {
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

    // Delete all DB data first (cascade handles related records).
    await prisma.user.delete({ where: { id: user.id } });

    // Then remove the Clerk account so the user can't log back in.
    const clerk = await clerkClient();
    await clerk.users.deleteUser(clerkUser.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/user/delete]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete account" },
      { status: 500 }
    );
  }
}
