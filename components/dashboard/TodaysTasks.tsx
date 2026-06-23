'use client';

import { useState } from 'react';
import { CalendarDays, Plus, Check, Circle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Task, Subject } from '@/types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  userId: string;
  examId: string;
  subjects: Subject[];
}

export default function TodaysTasks({ tasks, setTasks, userId, examId, subjects }: Props) {
  const [newTask, setNewTask] = useState('');
  const [adding, setAdding] = useState(false);

  async function toggleTask(task: Task) {
    const { error } = await supabase
      .from('tasks')
      .update({ completed: !task.completed })
      .eq('id', task.id);
    if (!error) {
      setTasks(tasks.map((t) => t.id === task.id ? { ...t, completed: !t.completed } : t));
    }
  }

  async function addTask() {
    if (!newTask.trim() || !userId) return;
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userId,
        exam_id: examId || null,
        title: newTask.trim(),
        due_date: today,
        completed: false,
        priority: 'MEDIUM',
      })
      .select('*, subject:subjects(name, color)')
      .single();
    if (!error && data) {
      setTasks([...tasks, data]);
      setNewTask('');
      setAdding(false);
    } else {
      toast.error('Failed to add task');
    }
  }

  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-violet-400" />
          <h3 className="font-semibold text-white">Today's Plan</h3>
        </div>
        <Link href="/planner" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1">
          View Planner <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      <div className="text-sm text-slate-400 mb-1">
        {completed} / {tasks.length} Tasks Completed
      </div>
      <div className="progress-bar mb-4">
        <div className="progress-fill" style={{ width: tasks.length > 0 ? `${(completed / tasks.length) * 100}%` : '0%' }} />
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {tasks.map((task) => (
          <button
            key={task.id}
            onClick={() => toggleTask(task)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/3 transition-colors text-left group"
          >
            <div className={cn(
              'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all',
              task.completed ? 'bg-green-500 border-green-500' : 'border-slate-500 group-hover:border-violet-400'
            )}>
              {task.completed && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className={cn('flex-1 text-sm', task.completed ? 'line-through text-slate-600' : 'text-slate-200')}>
              {task.title}
            </span>
            {task.subject && (
              <span
                className="text-xs px-2 py-0.5 rounded-md font-medium"
                style={{ background: `${task.subject.color}25`, color: task.subject.color }}
              >
                {task.subject.name}
              </span>
            )}
          </button>
        ))}

        {tasks.length === 0 && !adding && (
          <div className="text-center py-6 text-slate-600 text-sm">No tasks for today. Add one!</div>
        )}

        {adding && (
          <div className="flex gap-2 mt-2">
            <input
              autoFocus
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTask()}
              onBlur={() => !newTask && setAdding(false)}
              placeholder="Task name..."
              className="flex-1 px-3 py-2 bg-white/5 border border-violet-500/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none"
            />
            <button onClick={addTask} className="px-3 py-2 bg-violet-600 rounded-xl text-white text-sm hover:bg-violet-500">
              Add
            </button>
          </div>
        )}
      </div>

      <button
        onClick={() => setAdding(true)}
        className="mt-4 flex items-center gap-2 text-sm text-slate-500 hover:text-violet-400 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add New Task
      </button>
    </div>
  );
}
