export default function SettingsLoading() {
  return (
    <div className="max-w-2xl animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-7 w-24 rounded-lg bg-white/8" />
        <div className="h-4 w-64 rounded-lg bg-white/5" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-white/5 border border-white/8" />
        ))}
      </div>
    </div>
  );
}
