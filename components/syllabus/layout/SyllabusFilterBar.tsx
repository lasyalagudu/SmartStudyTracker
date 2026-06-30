"use client";

import { Search, Plus } from "lucide-react";

interface SubjectOption {
  id: string;
  name: string;
}

interface Props {
  search: string;
  setSearch: (value: string) => void;

  subjectFilter: string;
  setSubjectFilter: (value: string) => void;

  statusFilter: string;
  setStatusFilter: (value: string) => void;

  difficultyFilter: string;
  setDifficultyFilter: (value: string) => void;

  priorityFilter: string;
  setPriorityFilter: (value: string) => void;

  sortBy: string;
  setSortBy: (value: string) => void;

  subjects: SubjectOption[];

  onAddSubject: () => void;
  onAddTopic: () => void;
  disableAddTopic?: boolean;
}

export default function SyllabusFilterBar({
  search,
  setSearch,
  subjectFilter,
  setSubjectFilter,
  statusFilter,
  setStatusFilter,
  difficultyFilter,
  setDifficultyFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  subjects,
  onAddSubject,
  onAddTopic,
  disableAddTopic,
}: Props) {
  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-4">
      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60"
          />
        </div>

        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/60"
        >
          <option value="ALL">All Subjects</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/60"
        >
          <option value="ALL">All Status</option>
          <option value="NOT_STARTED">Not Started</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/60"
        >
          <option value="ALL">All Difficulty</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/60"
        >
          <option value="ALL">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500/60"
        >
          <option value="ORDER">Default</option>
          <option value="PRIORITY">Priority</option>
          <option value="DIFFICULTY">Difficulty</option>
          <option value="PROGRESS">Progress</option>
          <option value="ESTIMATED_HOURS">Estimated Hours</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={onAddSubject}
            className="px-4 py-3 border border-white/10 text-slate-300 rounded-xl text-sm hover:bg-white/5 transition-colors whitespace-nowrap"
          >
            + Subject
          </button>

          <button
            onClick={onAddTopic}
            disabled={disableAddTopic}
            className="flex items-center gap-2 px-4 py-3 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-500 transition-colors disabled:opacity-40 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Topic
          </button>
        </div>
      </div>
    </div>
  );
}