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
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { name } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "Exam name required" },
        { status: 400 }
      );
    }

    const exam = await prisma.exam.create({
      data: {
        userId: user.id,
        name: name.trim(),
        isActive: false,
      },
    });

    return NextResponse.json({ success: true, exam });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}