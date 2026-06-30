"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface Props {
  year: number;
  month: number;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
}

export default function MonthlyHeader({
  year,
  month,
  setYear,
  setMonth,
}: Props) {
  const today = new Date();
  const isCurrentMonth =
    year === today.getFullYear() && month === today.getMonth() + 1;

  function goPreviousMonth() {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  }

  function goNextMonth() {
    if (isCurrentMonth) return;

    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  }

  return (
    <div className="bg-[#0A0F1E] border border-white/8 rounded-2xl p-5 flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-white">Monthly Analytics</h2>
        <p className="text-sm text-slate-500 mt-1">
          Track your progress, consistency, and performance month by month.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={goPreviousMonth}
          className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="min-w-36 text-center">
          <div className="text-white font-semibold">
            {MONTHS[month - 1]} {year}
          </div>
          {isCurrentMonth && (
            <div className="text-xs text-violet-400 mt-0.5">
              Current Month
            </div>
          )}
        </div>

        <button
          onClick={goNextMonth}
          disabled={isCurrentMonth}
          className="p-2 rounded-xl border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}