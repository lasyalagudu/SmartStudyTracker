import { Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";

function PageFallback() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-white/8" />
      <div className="h-4 w-64 rounded-lg bg-white/5" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-40 rounded-2xl bg-white/5 border border-white/8" />
        ))}
      </div>
    </div>
  );
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch once per request — React cache() deduplicates across layout + pages.
  const mentorStatus = await getUserMentorStatus();

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-[#070B14]">
        <Sidebar
          isApprovedMentor={mentorStatus?.isApprovedMentor ?? false}
          isAdmin={mentorStatus?.isAdmin ?? false}
          mentorStatus={mentorStatus?.mentorStatus ?? null}
        />
        <Header />

        {/*
          Mobile (< lg): ml-0 — sidebar is an overlay.
          Desktop (>= lg): ml-64 — sits alongside the fixed sidebar.
          pt-16 clears the fixed header on all sizes.
        */}
        <main className="lg:ml-64 pt-16 min-h-screen">
          <div className="p-4 lg:p-8">
            <Suspense fallback={<PageFallback />}>
              {children}
            </Suspense>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
