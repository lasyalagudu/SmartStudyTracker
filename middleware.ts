import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/planner(.*)",
  "/syllabus(.*)",
  "/timer(.*)",
  "/analytics(.*)",
  "/revision(.*)",
  "/mistakes(.*)",
  "/settings(.*)",
  "/pro(.*)",
  "/mentor-connect(.*)",
  "/mentor-dashboard(.*)",
  "/mentor-studio(.*)",
  "/admin(.*)",
  // sso-callback must be protected so currentUser() works inside it
  "/sso-callback(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};