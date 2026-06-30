import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const data: any = {};

    if ("resolved" in body) data.resolved = body.resolved;
    if ("title" in body) data.title = body.title;
    if ("description" in body) data.description = body.description;
    if ("mistakeType" in body) data.mistakeType = body.mistakeType;
    if ("subjectId" in body) data.subjectId = body.subjectId || null;
    if ("topicId" in body) data.topicId = body.topicId || null;

    const mistake = await prisma.mistake.update({
      where: {
        id,
        userId: user.id,
      },
      data,
      include: {
        subject: true,
        topic: true,
      },
    });

    return NextResponse.json({ mistake });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    await prisma.mistake.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}