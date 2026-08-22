export default function SyllabusLoading() {
  return (
    <div className="max-w-7xl space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-lg bg-white/8" />
        <div className="h-4 w-80 rounded-lg bg-white/5" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-white/5 border border-white/8" />
        ))}
      </div>
      <div className="h-16 rounded-2xl bg-white/5 border border-white/8" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-14 rounded-xl bg-white/5 border border-white/8" />
        ))}
      </div>
    </div>
  );
}
