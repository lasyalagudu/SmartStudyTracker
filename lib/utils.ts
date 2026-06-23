import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function daysUntil(date: string | Date) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getTopicCompletion(topic: {
  theory_done: boolean;
  problems_done: boolean;
  pyqs_done: boolean;
  revision_done: boolean;
  mastered: boolean;
}) {
  const checks = [topic.theory_done, topic.problems_done, topic.pyqs_done, topic.revision_done, topic.mastered];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

export function greetUser(name: string | null) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return `${greeting}, ${name?.split(' ')[0] ?? 'Scholar'}!`;
}
