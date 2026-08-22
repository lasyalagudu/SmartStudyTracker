export default function DashboardLoading() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      <div className="space-y-2">
        <div className="h-7 w-56 rounded-lg bg-white/8" />
        <div className="h-4 w-44 rounded-lg bg-white/5" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/8" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 rounded-2xl bg-white/5 border border-white/8" />
        <div className="h-64 rounded-2xl bg-white/5 border border-white/8" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-48 rounded-2xl bg-white/5 border border-white/8" />
        <div className="h-48 rounded-2xl bg-white/5 border border-white/8" />
      </div>
    </div>
  );
}
