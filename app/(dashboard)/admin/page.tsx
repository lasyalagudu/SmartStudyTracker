
import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminPanelClient from "./AdminPanelClient";

export const metadata: Metadata = {
  title: "Admin | SmartStudy Tracker",
};

export default async function AdminPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) redirect("/sign-in");

  // Server-side admin authorization
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { role: true },
  });

  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [pending, approved, rejected] = await Promise.all([
    prisma.mentorProfile.findMany({
      where: { status: "PENDING_REVIEW" },
      orderBy: { createdAt: "asc" },
      include: {
        user: { select: { name: true, email: true } },
        exams: true,
        achievements: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { bookings: true },
        },
      },
    }),

    prisma.mentorProfile.findMany({
      where: { status: "APPROVED" },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        user: { select: { name: true, email: true } },
        exams: true,
        achievements: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { bookings: true },
        },
      },
    }),

    prisma.mentorProfile.findMany({
      where: {
        status: { in: ["REJECTED", "SUSPENDED"] },
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
      include: {
        user: { select: { name: true, email: true } },
        exams: true,
        achievements: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { bookings: true },
        },
      },
    }),
  ]);

  return (
    <AdminPanelClient
      pending={pending as never}
      approved={approved as never}
      rejected={rejected as never}
    />
  );
}
