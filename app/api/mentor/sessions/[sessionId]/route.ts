/**
 * PATCH  /api/mentor/sessions/[sessionId]  — update a session
 * DELETE /api/mentor/sessions/[sessionId]  — soft-delete (isActive=false)
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

async function getMentorSession(clerkId: string, sessionId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId } });
  if (!user) return null;
  const mentor = await prisma.mentorProfile.findUnique({ where: { userId: user.id } });
  if (!mentor) return null;
  const session = await prisma.mentorSession.findFirst({
    where: { id: sessionId, mentorId: mentor.id },
  });
  return session ? { mentor, session } : null;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sessionId } = await params;
    const result = await getMentorSession(clerkUser.id, sessionId);
    if (!result) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    const { title, description, durationMins, priceInPaise, isActive } = await req.json();

    const updated = await prisma.mentorSession.update({
      where: { id: sessionId },
      data: {
        ...(title        != null ? { title }        : {}),
        ...(description  != null ? { description }  : {}),
        ...(durationMins != null ? { durationMins } : {}),
        ...(priceInPaise != null ? { priceInPaise } : {}),
        ...(isActive     != null ? { isActive }     : {}),
      },
    });

    return NextResponse.json({ success: true, session: updated });
  } catch (error) {
    console.error("[sessions/[id]] PATCH error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sessionId } = await params;
    const result = await getMentorSession(clerkUser.id, sessionId);
    if (!result) return NextResponse.json({ error: "Session not found" }, { status: 404 });

    // Soft delete — preserve booking history
    await prisma.mentorSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[sessions/[id]] DELETE error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
