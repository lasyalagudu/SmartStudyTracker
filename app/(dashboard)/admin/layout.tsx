
import { redirect } from "next/navigation";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const status = await getUserMentorStatus();

  // Require an authenticated user with a database record
  if (!status) {
    redirect("/sign-in");
  }

  // Only ADMIN role can access admin pages
  if (!status.isAdmin) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
