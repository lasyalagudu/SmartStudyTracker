/**
 * Cached user + exams fetcher for server components.
 *
 * React's `cache()` deduplicates calls within a single server render cycle,
 * so the Header and any page that both call `getCachedUser()` will share the
 * same DB result — zero extra round-trips.
 */
import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export const getCachedUser = cache(async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    include: {
      exams: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return user;
});
