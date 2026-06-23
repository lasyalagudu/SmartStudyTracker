import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: {
        clerkId: clerkUser.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { subjectId, topics } = body;

    if (!subjectId || !Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: "Subject and topics are required" },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.findFirst({
      where: {
        id: subjectId,
        exam: {
          userId: user.id,
        },
      },
    });

    if (!subject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    const createdTopics = await prisma.$transaction(
      topics.map((topic: { name: string; order: number }) =>
        prisma.topic.create({
          data: {
            subjectId,
            name: topic.name,
            order: topic.order,
          },
        })
      )
    );

    return NextResponse.json({ topics: createdTopics });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}