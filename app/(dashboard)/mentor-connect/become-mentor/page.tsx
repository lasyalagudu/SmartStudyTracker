import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";
import { prisma } from "@/lib/prisma";
import BecomeMentorClient from "./BecomeMentorClient";
import { AlertCircle, Clock, XCircle } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Become a Mentor | SmartStudy Tracker",
  description: "Share your exam preparation journey and help the next batch of students.",
};

export default async function BecomeMentorPage() {
  const status = await getUserMentorStatus();
  if (!status) redirect("/sign-in");

  // Approved mentors already have a studio — send them there
  if (status.isApprovedMentor) redirect("/mentor-studio");

  // Suspended — blocked from re-applying
  if (status.mentorStatus === "SUSPENDED") redirect("/mentor-connect?status=suspended");

  // PENDING_REVIEW — show a waiting screen, don't allow editing the application
  if (status.mentorStatus === "PENDING_REVIEW") {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-white text-2xl font-bold mb-3">Application Under Review</h2>
        <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm mx-auto">
          We&apos;re reviewing your mentor application. Our team verifies each profile
          manually to maintain quality. This usually takes 1–3 business days.
        </p>
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 text-left mb-6 space-y-2">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">What happens next</p>
          {[
            "Our team reviews your profile and achievements",
            "You receive an email notification once a decision is made",
            "If approved, the Mentor Studio unlocks immediately",
            "If more information is needed, we'll reach out",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-violet-600/20 text-violet-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">
                {i + 1}
              </span>
              <p className="text-slate-300 text-sm">{step}</p>
            </div>
          ))}
        </div>
        <Link
          href="/mentor-connect"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 text-slate-300 rounded-xl text-sm font-medium hover:bg-white/8 transition-colors"
        >
          Back to Mentor Connect
        </Link>
      </div>
    );
  }

  // REJECTED — allow re-application, show rejection context
  const existingProfile = status.hasMentorProfile
    ? await prisma.mentorProfile.findUnique({
        where:   { userId: status.userId },
        include: { exams: { orderBy: { examYear: "desc" } } },
      })
    : null;

  const rejectionNote = existingProfile?.adminNote ?? null;

  return (
    <>
      {/* Rejection notice — shown above the form for REJECTED status */}
      {status.mentorStatus === "REJECTED" && (
        <div className="max-w-2xl mb-6">
          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-300 font-semibold text-sm">Previous application was not approved</p>
              {rejectionNote ? (
                <p className="text-slate-400 text-xs mt-1">
                  <span className="text-slate-500">Reason: </span>{rejectionNote}
                </p>
              ) : (
                <p className="text-slate-500 text-xs mt-1">
                  Please review and update your profile before resubmitting.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <BecomeMentorClient
        userName={status.name}
        existingProfile={existingProfile as never}
      />
    </>
  );
}
