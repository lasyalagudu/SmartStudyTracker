import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SSOCallbackPage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    redirect("/sign-in");
  }

  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    redirect("/sign-in");
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

  if (!user.onboardingCompleted) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}