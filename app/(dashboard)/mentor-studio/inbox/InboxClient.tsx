"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Thread {
  student: { id: string; name: string | null; email: string };
  lastMessage: string;
  lastAt: string;
  unread: number;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender?: { name: string | null };
}

interface Props {
  mentorId: string;
  mentorUserId: string;
  threads: Thread[];
}

export default function InboxClient({ mentorId, mentorUserId, threads: initialThreads }: Props) {
  const [threads, setThreads] = useState(initialThreads);
  const [activeStudent, setActiveStudent] = useState<Thread["student"] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeStudent) loadMessages(activeStudent.id);
  }, [activeStudent]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages(studentId: string) {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/mentor/messages?mentorId=${mentorId}&studentId=${studentId}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages ?? []);
        // Clear unread badge locally
        setThreads((prev) => prev.map((t) => t.student.id === studentId ? { ...t, unread: 0 } : t));
      }
    } catch { toast.error("Could not load messages"); }
    finally { setLoadingMessages(false); }
  }

  async function send() {
    if (!text.trim() || sending || !activeStudent) return;
    const content = text.trim();
    setText("");

    const temp: Message = {
      id: `temp-${Date.now()}`,
      content,
      senderId: mentorUserId,
      createdAt: new Date().toISOString(),
      sender: { name: "You" },
    };
    setMessages((prev) => [...prev, temp]);

    setSending(true);
    try {
      const res = await fetch("/api/mentor/messages/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, studentId: activeStudent.id, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => prev.map((m) => m.id === temp.id ? data.message : m));
      setThreads((prev) => prev.map((t) =>
        t.student.id === activeStudent.id ? { ...t, lastMessage: content, lastAt: new Date().toISOString() } : t
      ));
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
      setText(content);
      toast.error(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }
  function formatRelative(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return formatTime(iso);
    const y = new Date(now); y.setDate(now.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="w-5 h-5 text-violet-400" />
        <h1 className="text-2xl font-bold text-white">Inbox</h1>
        {totalUnread > 0 && (
          <span className="px-2 py-0.5 bg-violet-600 text-white text-xs font-bold rounded-full">
            {totalUnread}
          </span>
        )}
      </div>

      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl overflow-hidden" style={{ height: "calc(100vh - 220px)", minHeight: 500 }}>
        <div className="flex h-full">

          {/* Thread list */}
          <div className={cn(
            "flex-shrink-0 border-r border-white/8 overflow-y-auto",
            activeStudent ? "hidden md:flex md:flex-col w-72" : "flex flex-col w-full md:w-72"
          )}>
            {threads.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm">No messages yet.</p>
                <p className="text-slate-600 text-xs mt-1">Students will message you from your profile.</p>
              </div>
            ) : (
              threads.map((t) => (
                <button key={t.student.id}
                  onClick={() => setActiveStudent(t.student)}
                  className={cn(
                    "w-full text-left px-4 py-3.5 border-b border-white/5 hover:bg-white/3 transition-colors",
                    activeStudent?.id === t.student.id && "bg-violet-600/10 border-l-2 border-l-violet-500"
                  )}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-white text-sm font-medium truncate">{t.student.name ?? "Student"}</p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {t.unread > 0 && (
                        <span className="w-5 h-5 bg-violet-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {t.unread}
                        </span>
                      )}
                      <span className="text-xs text-slate-600">{formatRelative(t.lastAt)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{t.lastMessage}</p>
                </button>
              ))
            )}
          </div>

          {/* Chat panel */}
          <div className={cn(
            "flex-1 flex flex-col",
            !activeStudent && "hidden md:flex"
          )}>
            {!activeStudent ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare className="w-10 h-10 text-slate-700 mb-3" />
                <p className="text-slate-500 text-sm">Select a conversation</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/8 flex-shrink-0">
                  <button onClick={() => setActiveStudent(null)} className="md:hidden text-slate-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs text-violet-300 font-bold flex-shrink-0">
                    {(activeStudent.name ?? "S")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{activeStudent.name ?? "Student"}</p>
                    <p className="text-slate-600 text-xs">{activeStudent.email}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {loadingMessages ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-slate-600 text-sm">No messages yet. Send the first reply.</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === mentorUserId;
                      return (
                        <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                          <div className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-2.5",
                            isMe ? "bg-violet-600 text-white rounded-br-sm" : "bg-white/8 text-slate-200 rounded-bl-sm border border-white/5"
                          )}>
                            <p className="text-sm leading-relaxed">{m.content}</p>
                            <p className={cn("text-xs mt-1", isMe ? "text-violet-200/60" : "text-slate-600")}>
                              {formatTime(m.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="flex-shrink-0 p-4 border-t border-white/8">
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-violet-500/50 transition-colors">
                    <input ref={inputRef} type="text" value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                      placeholder="Type a reply…"
                      className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none" />
                    <button onClick={send} disabled={!text.trim() || sending}
                      className="w-8 h-8 flex items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 transition-all active:scale-90 flex-shrink-0">
                      {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
