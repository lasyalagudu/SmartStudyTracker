/**
 * GET /api/mentor/messages/unread
 * Returns unread message count for the current user.
 * Used by the sidebar badge and studio inbox tab.
 */
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ count: 0 });

    const user = await prisma.user.findUnique({ where: { clerkId: clerkUser.id } });
    if (!user) return NextResponse.json({ count: 0 });

    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    let count = 0;

    if (mentorProfile) {
      // Mentor: count unread messages from students
      count = await prisma.mentorMessage.count({
        where: {
          mentorId: mentorProfile.id,
          read: false,
          // Only count messages sent by students (not by the mentor themselves)
          senderId: { not: user.id },
        },
      });
    } else {
      // Student: count unread replies from mentors
      count = await prisma.mentorMessage.count({
        where: {
          studentId: user.id,
          read: false,
          senderId: { not: user.id },
        },
      });
    }

    return NextResponse.json({ count });
  } catch (error) {
    console.error("[messages/unread] GET:", error);
    return NextResponse.json({ count: 0 });
  }
}
