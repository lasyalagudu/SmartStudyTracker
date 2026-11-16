
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

interface Props {
  searchParams: Promise<{ intent?: string }>;
}

export default async function SSOCallbackPage({ searchParams }: Props) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    redirect("/sign-in");
  }

  const { intent } = await searchParams;

  const isMentorIntent = intent === "mentor";

  // Create or retrieve the database user.
  const user = await prisma.user.upsert({
    where: {
      clerkId: clerkUser.id,
    },
    update: {
      email,
      name: clerkUser.fullName,
      ...(isMentorIntent && {
        mentorSignupIntent: true,
      }),
    },
    create: {
      clerkId: clerkUser.id,
      email,
      name: clerkUser.fullName,
      mentorSignupIntent : isMentorIntent,
    },
  });

  // Mentor signup flow
  if (isMentorIntent || user.mentorSignupIntent) {
    redirect("/mentor-connect/become-mentor");
  }

  // Normal student signup flow
  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
