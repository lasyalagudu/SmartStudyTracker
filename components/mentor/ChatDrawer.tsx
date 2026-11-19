"use client";

import { useEffect, useRef, useState } from "react";
import { X, Send, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender?: { name: string | null };
}

interface Props {
  mentorId: string;
  mentorName: string;
  currentUserId: string;
  onClose: () => void;
}

export default function ChatDrawer({ mentorId, mentorName, currentUserId, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
    inputRef.current?.focus();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/mentor/messages?mentorId=${mentorId}`);
      const data = await res.json();
      if (res.ok) setMessages(data.messages ?? []);
    } catch {
      toast.error("Could not load messages");
    } finally {
      setLoading(false);
    }
  }

  async function send() {
    if (!text.trim() || sending) return;
    const content = text.trim();
    setText("");

    // Optimistic
    const temp: Message = {
      id: `temp-${Date.now()}`,
      content,
      senderId: currentUserId,
      createdAt: new Date().toISOString(),
      sender: { name: "You" },
    };
    setMessages((prev) => [...prev, temp]);

    setSending(true);
    try {
      const res = await fetch("/api/mentor/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessages((prev) => prev.map((m) => m.id === temp.id ? data.message : m));
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
      setText(content);
      toast.error(e instanceof Error ? e.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  }

  function formatDate(iso: string) {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  }

  // Group messages by date
  const grouped: { date: string; messages: Message[] }[] = [];
  messages.forEach((m) => {
    const date = formatDate(m.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === date) {
      last.messages.push(m);
    } else {
      grouped.push({ date, messages: [m] });
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="h-full w-full max-w-md bg-[#070B14] border-l border-white/10 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/8 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">{mentorName}</p>
              <p className="text-xs text-slate-500">Messages are async — mentor replies when available</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white rounded-xl hover:bg-white/5 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <MessageSquare className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-slate-500 text-sm">No messages yet.</p>
              <p className="text-slate-600 text-xs mt-1">
                Send a message to introduce yourself or ask a question.
              </p>
            </div>
          ) : (
            grouped.map(({ date, messages: group }) => (
              <div key={date}>
                {/* Date separator */}
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-slate-600">{date}</span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                <div className="space-y-2">
                  {group.map((m) => {
                    const isMe = m.senderId === currentUserId;
                    return (
                      <div key={m.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                        <div className={cn(
                          "max-w-[80%] rounded-2xl px-4 py-2.5",
                          isMe
                            ? "bg-violet-600 text-white rounded-br-sm"
                            : "bg-white/8 text-slate-200 rounded-bl-sm border border-white/5"
                        )}>
                          <p className="text-sm leading-relaxed">{m.content}</p>
                          <p className={cn("text-xs mt-1", isMe ? "text-violet-200/70" : "text-slate-600")}>
                            {formatTime(m.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex-shrink-0 p-4 border-t border-white/8">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 focus-within:border-violet-500/50 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Type a message…"
              className="flex-1 bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none"
            />
            <button
              onClick={send}
              disabled={!text.trim() || sending}
              className="w-8 h-8 flex items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 transition-all active:scale-90 flex-shrink-0"
            >
              {sending
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Send className="w-3.5 h-3.5" />
              }
            </button>
          </div>
          <p className="text-xs text-slate-700 text-center mt-2">Press Enter to send</p>
        </div>

      </div>
    </div>
  );
}
