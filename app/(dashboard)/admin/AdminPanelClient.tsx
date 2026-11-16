"use client";

import { useState } from "react";
import { Check, X, ShieldAlert, Eye, BadgeCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AchievementItem { id: string; title: string; fileUrl: string | null; status: string; }
interface MentorItem {
  id: string;
  headline: string;
  status: string;
  adminNote: string | null;
  user: { name: string | null; email: string };
  exams: { examName: string; examYear: number; rank: string | null }[];
  achievements: AchievementItem[];
  _count?: { bookings: number };
}

interface Props {
  pending: MentorItem[];
  approved: MentorItem[];
  rejected: MentorItem[];
}

type Tab = "pending" | "approved" | "rejected";

export default function AdminPanelClient({ pending: initialPending, approved: initialApproved, rejected: initialRejected }: Props) {
  const [tab, setTab] = useState<Tab>("pending");
  const [pending, setPending] = useState(initialPending);
  const [approved, setApproved] = useState(initialApproved);
  const [rejected, setRejected] = useState(initialRejected);
  const [noteMap, setNoteMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const lists: Record<Tab, MentorItem[]> = { pending, approved, rejected };

  async function act(mentorId: string, action: "APPROVE" | "REJECT" | "SUSPEND" | "UNSUSPEND") {
    setLoading(mentorId + action);
    try {
      const res = await fetch("/api/admin/mentor", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mentorId, action,
          ...(noteMap[mentorId] !== undefined
            ? { adminNote: noteMap[mentorId] }
            : {}),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);

      // Move between lists
      const existing = [...pending, ...approved, ...rejected].find(
        (m) => m.id === mentorId
      );

      if (existing) {
        const newStatus =
          action === "APPROVE" || action === "UNSUSPEND"
            ? "APPROVED"
            : action === "REJECT"
              ? "REJECTED"
              : "SUSPENDED";

        const updatedMentor = { ...existing, status: newStatus };

        setPending((prev) => prev.filter((m) => m.id !== mentorId));

        setApproved((prev) =>
          newStatus === "APPROVED"
            ? [updatedMentor, ...prev.filter((m) => m.id !== mentorId)]
            : prev.filter((m) => m.id !== mentorId)
        );

        setRejected((prev) =>
          newStatus === "REJECTED" || newStatus === "SUSPENDED"
            ? [updatedMentor, ...prev.filter((m) => m.id !== mentorId)]
            : prev.filter((m) => m.id !== mentorId)
        );
      }
      const messages = {
        APPROVE: "Mentor approved",
        REJECT: "Mentor rejected",
        SUSPEND: "Mentor suspended",
        UNSUSPEND: "Mentor unsuspended",
      };

      toast.success(messages[action]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(null);
    }
  }

  const [achievementLoading, setAchievementLoading] = useState<string | null>(null);

  async function verifyAchievement(achievementId: string, action: "VERIFY" | "REJECT") {

    setAchievementLoading(achievementId);
    try {
      const res = await fetch("/api/admin/mentor/achievements", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementId, action }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      toast.success(`Achievement ${action === "VERIFY" ? "verified" : "rejected"}`);
      // Update in place
      const update = (list: MentorItem[]) =>
        list.map((m) => ({
          ...m,
          achievements: m.achievements.map((a) =>
            a.id === achievementId
              ? {
                ...a,
                status: action === "VERIFY" ? "VERIFIED" : "REJECTED",
              }
              : a
          ),
        }));

      setPending((prev) => update(prev));
      setApproved((prev) => update(prev));
      setRejected((prev) => update(prev));
    } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    finally {
      setAchievementLoading(null);
    }
  }

  const TABS: { id: Tab; label: string; count: number }[] = [
    { id: "pending", label: "Pending Review", count: pending.length },
    { id: "approved", label: "Approved", count: approved.length },
    { id: "rejected", label: "Rejected / Suspended", count: rejected.length },
  ];

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <ShieldAlert className="w-6 h-6 text-amber-400" />
        <h1 className="text-2xl font-bold text-white">Admin — Mentor Verification</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#0A0F1E] border border-white/8 rounded-2xl p-1.5 mb-6">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn("flex-1 py-2 rounded-xl text-sm font-medium transition-all",
              tab === t.id ? "bg-violet-600 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
            )}>
            {t.label} {t.count > 0 && <span className="ml-1 bg-white/20 rounded-full px-1.5 py-0.5 text-xs">{t.count}</span>}
          </button>
        ))}
      </div>

      {/* List */}
      {lists[tab].length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <BadgeCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No mentors in this category.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {lists[tab].map((m) => (
            <div key={m.id} className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-white font-semibold">{m.user.name ?? "Unknown"}</h3>
                  <p className="text-slate-500 text-xs">{m.user.email}</p>
                  <p className="text-slate-400 text-sm mt-1">{m.headline}</p>
                </div>
                <StatusChip status={m.status} />
              </div>

              {/* Exams */}
              <div className="flex flex-wrap gap-2 mb-4">
                {m.exams.map((e) => (
                  <span key={e.examName + e.examYear} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-slate-400">
                    {e.examName} {e.examYear} {e.rank && `· AIR ${e.rank}`}
                  </span>
                ))}
              </div>

              {/* Achievements */}
              {m.achievements.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs text-slate-500 mb-2 font-medium">Certificates to verify:</h4>
                  <div className="space-y-2">
                    {m.achievements.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 p-2.5 bg-white/[0.02] border border-white/5 rounded-xl">
                        <div className="flex-1">
                          <p className="text-white text-xs font-medium">{a.title}</p>
                        </div>
                        {a.fileUrl && (
                          <a href={a.fileUrl} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-violet-400 hover:underline">
                            <Eye className="w-3 h-3" /> View
                          </a>
                        )}
                        <span className={cn("text-xs px-2 py-0.5 rounded-full",
                          a.status === "VERIFIED" ? "bg-green-500/15 text-green-400" :
                            a.status === "REJECTED" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"
                        )}>{a.status}</span>
                        {a.status === "PENDING" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => verifyAchievement(a.id, "VERIFY")}
                              disabled={achievementLoading === a.id}
                              className="p-1 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 disabled:opacity-40"
                            >
                              {achievementLoading === a.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </button>

                            <button
                              onClick={() => verifyAchievement(a.id, "REJECT")}
                              disabled={achievementLoading === a.id}
                              className="p-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 disabled:opacity-40"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin note */}
              <textarea
                value={noteMap[m.id] ?? m.adminNote ?? ""}
                onChange={(e) => setNoteMap({ ...noteMap, [m.id]: e.target.value })}
                placeholder="Admin note (optional)..."
                rows={2}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-xs resize-none focus:outline-none mb-3"
              />

              {/* Action buttons */}
              <div className="flex gap-2 flex-wrap">
                {m.status === "PENDING_REVIEW" && (
                  <>
                    <ActionBtn
                      label="Approve" color="green"
                      loading={loading === m.id + "APPROVE"}
                      onClick={() => act(m.id, "APPROVE")}
                    />
                    <ActionBtn
                      label="Reject" color="red"
                      loading={loading === m.id + "REJECT"}
                      onClick={() => act(m.id, "REJECT")}
                    />
                  </>
                )}
                {m.status === "APPROVED" && (
                  <ActionBtn
                    label="Suspend" color="red"
                    loading={loading === m.id + "SUSPEND"}
                    onClick={() => act(m.id, "SUSPEND")}
                  />
                )}
                {m.status === "REJECTED" && (
                  <ActionBtn
                    label="Approve" color="green"
                    loading={loading === m.id + "APPROVE"}
                    onClick={() => act(m.id, "APPROVE")}
                  />
                )}

                {m.status === "SUSPENDED" && (
                  <ActionBtn
                    label="Unsuspend" color="green"
                    loading={loading === m.id + "UNSUSPEND"}
                    onClick={() => act(m.id, "UNSUSPEND")}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const cfg: Record<string, string> = {
    PENDING_REVIEW: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    APPROVED: "bg-green-500/15 text-green-400 border-green-500/20",
    REJECTED: "bg-red-500/15 text-red-400 border-red-500/20",
    SUSPENDED: "bg-red-500/15 text-red-400 border-red-500/20",
    DRAFT: "bg-white/10 text-slate-400 border-white/10",
  };
  return (
    <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium flex-shrink-0", cfg[status] ?? cfg.DRAFT)}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function ActionBtn({ label, color, loading, onClick }: { label: string; color: "green" | "red"; loading: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={loading}
      className={cn(
        "flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium border disabled:opacity-40 transition-all",
        color === "green"
          ? "bg-green-600/20 border-green-500/30 text-green-400 hover:bg-green-600/30"
          : "bg-red-600/20 border-red-500/30 text-red-400 hover:bg-red-600/30"
      )}
    >
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : color === "green" ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />
      }
      {label}
    </button>
  );
}
