import { Suspense } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { SidebarProvider } from "@/components/layout/SidebarContext";

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // SidebarProvider wraps both Sidebar and Header so the hamburger button
    // in the header can open/close the sidebar via shared context.
    <SidebarProvider>
      <div className="min-h-screen bg-[#070B14]">
        <Sidebar />
        <Header />

        {/*
          On mobile (< lg): ml-0 because sidebar is an overlay, not inline.
          On desktop (>= lg): ml-64 to sit alongside the fixed sidebar.
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
