export default function PlannerLoading() {
  return (
    <div className="max-w-3xl animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-7 w-36 rounded-lg bg-white/8" />
          <div className="h-4 w-52 rounded-lg bg-white/5" />
        </div>
        <div className="h-9 w-24 rounded-xl bg-white/8" />
      </div>
      <div className="h-14 rounded-2xl bg-white/5 border border-white/8 mb-6" />
      <div className="h-20 rounded-2xl bg-white/5 border border-white/8 mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/5 border border-white/8" />
        ))}
      </div>
    </div>
  );
}
