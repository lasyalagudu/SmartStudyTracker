/**
 * GET  /api/mentor/messages?mentorId=xxx   — fetch a thread between current user and a mentor
 * POST /api/mentor/messages                — send a message
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const mentorId = searchParams.get("mentorId");
    if (!mentorId) return NextResponse.json({ error: "mentorId required" }, { status: 400 });

    // Verify this user is either the student OR the mentor in this thread
    const mentorProfile = await prisma.mentorProfile.findUnique({ where: { id: mentorId } });
    if (!mentorProfile) return NextResponse.json({ error: "Mentor not found" }, { status: 404 });

    const isMentor = mentorProfile.userId === user.id;

    // For mentor: load all conversations grouped by student
    if (isMentor) {
      const studentId = searchParams.get("studentId");
      if (!studentId) {
        // Return list of unique students who have messaged this mentor
        const threads = await prisma.mentorMessage.findMany({
          where: { mentorId },
          orderBy: { createdAt: "desc" },
          distinct: ["studentId"],
          include: {
            student: { select: { id: true, name: true, email: true } },
          },
        });

        // Add unread count per thread
        const withUnread = await Promise.all(
          threads.map(async (t) => {
            const unread = await prisma.mentorMessage.count({
              where: { mentorId, studentId: t.studentId, read: false, senderId: t.studentId },
            });
            return { student: t.student, lastMessage: t.content, lastAt: t.createdAt, unread };
          })
        );

        return NextResponse.json({ threads: withUnread });
      }

      // Single thread
      const messages = await prisma.mentorMessage.findMany({
        where: { mentorId, studentId },
        orderBy: { createdAt: "asc" },
        include: { sender: { select: { name: true } } },
      });

      // Mark student messages as read
      await prisma.mentorMessage.updateMany({
        where: { mentorId, studentId, senderId: studentId, read: false },
        data: { read: true },
      });

      return NextResponse.json({ messages });
    }

    // For student: load thread with this mentor
    const messages = await prisma.mentorMessage.findMany({
      where: { mentorId, studentId: user.id },
      orderBy: { createdAt: "asc" },
      include: { sender: { select: { name: true } } },
    });

    // Mark mentor messages as read
    await prisma.mentorMessage.updateMany({
      where: { mentorId, studentId: user.id, senderId: mentorProfile.userId, read: false },
      data: { read: true },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("[messages] GET:", error);
    return NextResponse.json({ error: "Failed to load messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { mentorId, content } = await req.json();

    if (!mentorId || !content?.trim()) {
      return NextResponse.json({ error: "mentorId and content required" }, { status: 400 });
    }

    const mentorProfile = await prisma.mentorProfile.findUnique({ where: { id: mentorId } });
    if (!mentorProfile || mentorProfile.status !== "APPROVED") {
      return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    }

    const isMentor = mentorProfile.userId === user.id;
    if (isMentor) {
      return NextResponse.json({ error: "Use studentId to reply as mentor" }, { status: 400 });
    }

    // Prevent messaging yourself
    if (mentorProfile.userId === user.id) {
      return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
    }

    const message = await prisma.mentorMessage.create({
      data: {
        mentorId,
        studentId: user.id,
        senderId: user.id,
        content: content.trim(),
      },
      include: { sender: { select: { name: true } } },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("[messages] POST:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
