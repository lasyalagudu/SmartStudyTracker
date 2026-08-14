/**
 * Header — server component.
 *
 * Uses the per-request cached helper so DB data is shared with whichever
 * page also calls getCachedUser() in the same render, eliminating duplicate
 * Prisma queries on every navigation.
 */
import { getCachedUser } from "@/lib/getUser";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const user = await getCachedUser();

  if (!user) return null;

  const activeExam =
    user.exams.find((exam) => exam.isActive) ?? user.exams[0] ?? null;

  return (
    <HeaderClient
      profile={user}
      exams={user.exams}
      activeExam={activeExam}
    />
  );
}
