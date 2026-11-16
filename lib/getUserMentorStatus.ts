/**
 * lib/getUserMentorStatus.ts
 *
 * Single cached server-side query that returns everything the layout needs
 * to decide navigation mode and access gates.
 *
 * Uses React `cache()` so it runs at most once per request even though
 * the layout, sidebar, and individual pages all call it independently.
 */

import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { MentorStatus } from "@/types/mentor";

export interface UserMentorStatus {
  /** DB user id */
  userId: string;
  /** Display name from DB (synced from Clerk) */
  name: string | null;
  email: string;
  /** Whether the user has ADMIN role in DB */
  isAdmin: boolean;
  /** Whether a MentorProfile row exists at all */
  hasMentorProfile: boolean;
  /** MentorProfile.id — null if no profile */
  mentorProfileId: string | null;
  /** MentorProfile.status — null if no profile */
  mentorStatus: MentorStatus | null;
  /** True only when status === "APPROVED" — the gate for Mentor Studio */
  isApprovedMentor: boolean;
}

/**
 * Returns null when the Clerk session is missing (unauthenticated).
 * Returns null when no DB user record exists (pre-onboarding).
 */
export const getUserMentorStatus = cache(
  async (): Promise<UserMentorStatus | null> => {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: {
        id:    true,
        name:  true,
        email: true,
        role:  true,
        mentorProfile: {
          select: {
            id:     true,
            status: true,
          },
        },
      },
    });

    if (!user) return null;

    const mentorStatus = (user.mentorProfile?.status ?? null) as MentorStatus | null;

    return {
      userId:           user.id,
      name:             user.name,
      email:            user.email,
      isAdmin:          user.role === "ADMIN",
      hasMentorProfile: !!user.mentorProfile,
      mentorProfileId:  user.mentorProfile?.id ?? null,
      mentorStatus,
      isApprovedMentor: mentorStatus === "APPROVED",
    };
  }
);
