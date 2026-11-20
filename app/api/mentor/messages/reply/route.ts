/**
 * POST /api/mentor/messages/reply
 * Mentor replies to a student's message thread.
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { mentorId, studentId, content } = await req.json();
    if (!mentorId || !studentId || !content?.trim()) {
      return NextResponse.json({ error: "mentorId, studentId and content required" }, { status: 400 });
    }

    // Verify sender is the mentor
    const mentorProfile = await prisma.mentorProfile.findUnique({ where: { id: mentorId } });
    if (!mentorProfile || mentorProfile.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.mentorMessage.create({
      data: {
        mentorId,
        studentId,
        senderId: user.id,
        content: content.trim(),
      },
      include: { sender: { select: { name: true } } },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("[messages/reply] POST:", error);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
