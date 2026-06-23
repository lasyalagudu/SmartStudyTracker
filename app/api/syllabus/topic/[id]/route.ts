import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function calculateStatus(topic: {
  theoryDone: boolean;
  problemsDone: boolean;
  pyqsDone: boolean;
  revisionDone: boolean;
  mastered: boolean;
}) {
  if (topic.mastered) return "COMPLETED";

  const allDone =
    topic.theoryDone &&
    topic.problemsDone &&
    topic.pyqsDone &&
    topic.revisionDone;

  if (allDone) return "COMPLETED";

  if (
    topic.theoryDone ||
    topic.problemsDone ||
    topic.pyqsDone ||
    topic.revisionDone
  ) {
    return "IN_PROGRESS";
  }

  return "NOT_STARTED";
}

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
      where: {
        clerkId: clerkUser.id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingTopic = await prisma.topic.findFirst({
      where: {
        id,
        subject: {
          exam: {
            userId: user.id,
          },
        },
      },
    });

    if (!existingTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const body = await req.json();

    if (body.bulkComplete) {
      const topic = await prisma.topic.update({
        where: {
          id,
        },
        data: {
          theoryDone: true,
          problemsDone: true,
          pyqsDone: true,
          revisionDone: true,
          mastered: true,
          status: "COMPLETED",
        },
      });

      return NextResponse.json({ topic });
    }

    const allowedFields = [
      "theoryDone",
      "problemsDone",
      "pyqsDone",
      "revisionDone",
      "mastered",
    ];

    if (!allowedFields.includes(body.field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    const updatedDraft = {
      ...existingTopic,
      [body.field]: body.value,
    };

    const status = calculateStatus(updatedDraft);

    const topic = await prisma.topic.update({
      where: {
        id,
      },
      data: {
        [body.field]: body.value,
        status,
      },
    });

    return NextResponse.json({ topic });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Something went wrong" },
      { status: 500 }
    );
  }
}