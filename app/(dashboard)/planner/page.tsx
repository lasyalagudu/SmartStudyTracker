"use client";

import { useEffect, useState } from "react";
import type { Subject, Task } from "@/types";
import {
  Plus,
  Check,
  Trash2,
  CalendarDays,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn, formatDate } from "@/lib/utils";

function dateStr(d: Date) {
  return d.toISOString().split("T")[0];
}

function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;
const PRIORITY_COLORS = { LOW: "#059669", MEDIUM: "#D97706", HIGH: "#DC2626" };

export default function PlannerPage() {
  const [userId, setUserId] = useState("");
  const [examId, setExamId] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newSubjectId, setNewSubjectId] = useState("");
  const [newPriority, setNewPriority] =
    useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    load(selectedDate);
  }, []);

  async function load(date: Date) {
    setLoading(true);
    const res = await fetch(`/api/planner?date=${dateStr(date)}`);
    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || "Failed to load planner");
      setLoading(false);
      return;
    }

    setUserId(data.userId);
    setExamId(data.examId);
    setSubjects(data.subjects ?? []);
    setTasks(data.tasks ?? []);
    setLoading(false);
  }

  async function changeDate(d: Date) {
    setSelectedDate(d);
    await load(d);
  }

  async function toggleTask(task: Task) {
    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });

    if (!res.ok) {
      toast.error("Failed to update task");
      return;
    }

    setTasks(
      tasks.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      )
    );
  }

  async function deleteTask(id: string) {
    const res = await fetch(`/api/tasks/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      toast.error("Failed to delete");
      return;
    }

    setTasks(tasks.filter((t) => t.id !== id));
  }

  async function addTask() {
    if (!newTitle.trim()) return;

    setAdding(true);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        examId,
        subjectId: newSubjectId || null,
        title: newTitle.trim(),
        dueDate: dateStr(selectedDate),
        priority: newPriority,
      }),
    });

    const data = await res.json();
    setAdding(false);

    if (!res.ok) {
      toast.error(data.error || "Failed to add task");
      return;
    }

    setTasks([...tasks, data.task]);
    setNewTitle("");
    setNewSubjectId("");
    setNewPriority("MEDIUM");
    setShowForm(false);
    toast.success("Task added!");
  }

  const isToday = dateStr(selectedDate) === dateStr(new Date());
  const completed = tasks.filter((t) => t.completed).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Daily Planner</h1>
          <p className="text-slate-400 text-sm mt-1">
            Plan your day, track your progress.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </div>

      <div className="flex items-center gap-3 mb-6 bg-[#0A0F1E] border border-white/8 rounded-2xl px-4 py-3">
        <button
          onClick={() => changeDate(addDays(selectedDate, -1))}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 text-center">
          <div className="font-semibold text-white">
            {isToday ? "Today" : formatDate(selectedDate)}
          </div>
          {!isToday && (
            <div className="text-xs text-slate-500">
              {formatDate(selectedDate)}
            </div>
          )}
        </div>

        <button
          onClick={() => changeDate(addDays(selectedDate, 1))}
          className="p-1.5 rounded-lg hover:bg-white/5 transition-colors text-slate-400 hover:text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-medium text-white">
              {completed} / {tasks.length} tasks completed
            </span>
          </div>
          <span className="text-xs text-slate-500">
            {tasks.length === 0
              ? "No tasks"
              : `${Math.round((completed / tasks.length) * 100)}%`}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width:
                tasks.length > 0 ? `${(completed / tasks.length) * 100}%` : "0%",
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className={cn(
              "bg-[#0A0F1E] border rounded-xl p-4 flex items-center gap-3 transition-all",
              task.completed
                ? "border-white/5 opacity-60"
                : "border-white/8 hover:border-violet-500/20"
            )}
          >
            <button
              onClick={() => toggleTask(task)}
              className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                task.completed
                  ? "bg-green-500 border-green-500"
                  : "border-slate-500 hover:border-violet-400"
              )}
            >
              {task.completed && <Check className="w-3 h-3 text-white" />}
            </button>

            <div className="flex-1 min-w-0">
              <span
                className={cn(
                  "text-sm",
                  task.completed ? "line-through text-slate-600" : "text-white"
                )}
              >
                {task.title}
              </span>

              {task.subject && (
                <div className="mt-1">
                  <span
                    className="text-xs px-2 py-0.5 rounded-md"
                    style={{
                      background: `${task.subject.color}20`,
                      color: task.subject.color,
                    }}
                  >
                    {task.subject.name}
                  </span>
                </div>
              )}
            </div>

            <div
              className="w-2 h-8 rounded-full flex-shrink-0"
              style={{
                background: PRIORITY_COLORS[task.priority] + "40",
                borderLeft: `2px solid ${PRIORITY_COLORS[task.priority]}`,
              }}
              title={`${task.priority} priority`}
            />

            <button
              onClick={() => deleteTask(task.id)}
              className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <div className="text-sm">No tasks for this day.</div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-violet-400 text-sm hover:text-violet-300"
            >
              Add a task →
            </button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0F1E] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-white">Add Task</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-500 hover:text-white"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Task Title
                </label>
                <input
                  autoFocus
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addTask()}
                  placeholder="What do you want to study?"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 transition-all"
                />
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Subject (optional)
                </label>
                <select
                  value={newSubjectId}
                  onChange={(e) => setNewSubjectId(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-violet-500/60 transition-all"
                >
                  <option value="">No subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Priority
                </label>
                <div className="flex gap-2">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewPriority(p)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-sm font-medium border transition-all",
                        newPriority === p
                          ? "text-white"
                          : "border-white/10 text-slate-500 hover:text-slate-300"
                      )}
                      style={
                        newPriority === p
                          ? {
                              background: `${PRIORITY_COLORS[p]}25`,
                              borderColor: `${PRIORITY_COLORS[p]}60`,
                              color: PRIORITY_COLORS[p],
                            }
                          : {}
                      }
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-white/15 text-slate-300 rounded-xl text-sm hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  disabled={!newTitle.trim() || adding}
                  className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-500 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {adding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}