export default function AnalyticsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-28 rounded-lg bg-white/8" />
        <div className="h-4 w-56 rounded-lg bg-white/5" />
      </div>
      <div className="h-12 rounded-2xl bg-white/5 border border-white/8" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-white/5 border border-white/8" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-56 rounded-2xl bg-white/5 border border-white/8" />
        ))}
      </div>
    </div>
  );
}
