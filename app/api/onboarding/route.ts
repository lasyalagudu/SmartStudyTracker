import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const colors = ["#7C3AED", "#2563EB", "#059669", "#D97706", "#DC2626", "#0891B2"];

export async function POST(req: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Email not found" }, { status: 400 });
    }

    const body = await req.json();
    const { examName, targetDate, subjects } = body;

    if (!examName) {
      return NextResponse.json({ error: "Exam is required" }, { status: 400 });
    }

    const user = await prisma.user.upsert({
      where: { clerkId: clerkUser.id },
      update: {
        email,
        name: clerkUser.fullName,
      },
      create: {
        clerkId: clerkUser.id,
        email,
        name: clerkUser.fullName,
      },
    });

    await prisma.exam.updateMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    });

    const exam = await prisma.exam.create({
      data: {
        userId: user.id,
        name: examName,
        targetDate: targetDate ? new Date(targetDate) : null,
        isActive: true,
        subjects: {
          create: Array.isArray(subjects)
            ? subjects.map((name: string, index: number) => ({
                name,
                color: colors[index % colors.length],
                order: index,
              }))
            : [],
        },
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        onboardingCompleted: true,
      },
    });

    return NextResponse.json({ success: true, exam });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}