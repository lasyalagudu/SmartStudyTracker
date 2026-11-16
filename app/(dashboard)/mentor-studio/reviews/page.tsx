import type { Metadata } from "next";
import { getUserMentorStatus } from "@/lib/getUserMentorStatus";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Reviews | Mentor Studio" };

export default async function ReviewsPage() {
  const status = await getUserMentorStatus();
  if (!status) redirect("/sign-in");

  const mentor = await prisma.mentorProfile.findUnique({
    where:  { userId: status.userId },
    select: { id: true, avgRating: true, totalReviews: true },
  });
  if (!mentor) redirect("/mentor-connect/become-mentor");

  const reviews = await prisma.mentorReview.findMany({
    where:   { mentorId: mentor.id },
    orderBy: { createdAt: "desc" },
    include: { student: { select: { name: true } } },
  });

  const dist = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count:  reviews.filter((x) => x.rating === r).length,
  }));

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-white">Reviews</h1>

      {/* Rating summary */}
      {reviews.length > 0 && (
        <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-5xl font-bold text-white">{mentor.avgRating.toFixed(1)}</p>
              <div className="flex justify-center gap-0.5 mt-1">
                {[1,2,3,4,5].map((i) => (
                  <Star key={i} className={cn("w-4 h-4", i <= Math.round(mentor.avgRating) ? "text-amber-400 fill-amber-400" : "text-white/20")} />
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-1">{mentor.totalReviews} reviews</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {dist.map((d) => (
                <div key={d.rating} className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 w-4">{d.rating}</span>
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
                  <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all"
                      style={{ width: reviews.length > 0 ? `${(d.count / reviews.length) * 100}%` : "0%" }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 w-4">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Review list */}
      {reviews.length === 0 ? (
        <div className="text-center py-16">
          <Star className="w-10 h-10 text-slate-700 mx-auto mb-2" />
          <p className="text-slate-500 text-sm">No reviews yet. Complete sessions to receive feedback.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-[#0A0F1E] border border-white/8 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-medium text-sm">{r.student?.name ?? "Student"}</p>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className={cn("w-3.5 h-3.5", i <= r.rating ? "text-amber-400 fill-amber-400" : "text-white/20")} />
                  ))}
                </div>
              </div>
              {r.comment && <p className="text-slate-400 text-sm leading-relaxed">{r.comment}</p>}
              <p className="text-slate-600 text-xs mt-2">
                {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
