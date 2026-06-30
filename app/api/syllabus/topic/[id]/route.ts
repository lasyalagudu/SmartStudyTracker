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
      where: { clerkId: clerkUser.id },
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
      include: {
        resources: true,
      },
    });

    if (!existingTopic) {
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const body = await req.json();
    const now = new Date();

    if (body.bulkComplete) {
      const topic = await prisma.topic.update({
        where: { id },
        data: {
          theoryDone: true,
          problemsDone: true,
          pyqsDone: true,
          revisionDone: true,
          mastered: true,
          status: "COMPLETED",
          completedAt: existingTopic.completedAt ?? now,
          lastRevisedAt: now,
        },
        include: {
          resources: true,
        },
      });

      return NextResponse.json({ topic });
    }

    const data: any = {};

    const allowedDirectFields = [
      "theoryDone",
      "problemsDone",
      "pyqsDone",
      "revisionDone",
      "mastered",
      "difficulty",
      "priority",
      "estimatedHours",
      "confidence",
      "notes",
      "doubts",
    ];

    if (body.field) {
      if (!allowedDirectFields.includes(body.field)) {
        return NextResponse.json({ error: "Invalid field" }, { status: 400 });
      }

      data[body.field] = body.value;
    }

    const directUpdateFields = [
      "difficulty",
      "priority",
      "estimatedHours",
      "confidence",
      "notes",
      "doubts",
    ];

    directUpdateFields.forEach((field) => {
      if (field in body) {
        data[field] = body[field];
      }
    });

    const draft = {
      theoryDone:
        "theoryDone" in data ? Boolean(data.theoryDone) : existingTopic.theoryDone,
      problemsDone:
        "problemsDone" in data
          ? Boolean(data.problemsDone)
          : existingTopic.problemsDone,
      pyqsDone:
        "pyqsDone" in data ? Boolean(data.pyqsDone) : existingTopic.pyqsDone,
      revisionDone:
        "revisionDone" in data
          ? Boolean(data.revisionDone)
          : existingTopic.revisionDone,
      mastered:
        "mastered" in data ? Boolean(data.mastered) : existingTopic.mastered,
    };

    const status = calculateStatus(draft);
    data.status = status;

    if (status === "COMPLETED" && !existingTopic.completedAt) {
      data.completedAt = now;
    }

    if (status !== "COMPLETED") {
      data.completedAt = null;
    }

    if (
      ("revisionDone" in data && data.revisionDone === true) ||
      ("mastered" in data && data.mastered === true)
    ) {
      data.lastRevisedAt = now;
    }

    if ("confidence" in data) {
      const confidence = Number(data.confidence);

      if (confidence < 0 || confidence > 5) {
        return NextResponse.json(
          { error: "Confidence must be between 0 and 5" },
          { status: 400 }
        );
      }

      data.confidence = confidence;
    }

    if ("estimatedHours" in data) {
      const estimatedHours = Number(data.estimatedHours);

      if (estimatedHours < 0) {
        return NextResponse.json(
          { error: "Estimated hours cannot be negative" },
          { status: 400 }
        );
      }

      data.estimatedHours = estimatedHours;
    }

    if (Array.isArray(body.resources)) {
      await prisma.topicResource.deleteMany({
        where: { topicId: id },
      });

      if (body.resources.length > 0) {
        await prisma.topicResource.createMany({
          data: body.resources
            .filter((r: any) => r.title && r.url)
            .map((r: any) => ({
              topicId: id,
              title: r.title,
              url: r.url,
            })),
        });
      }
    }

    const topic = await prisma.topic.update({
      where: { id },
      data,
      include: {
        resources: true,
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