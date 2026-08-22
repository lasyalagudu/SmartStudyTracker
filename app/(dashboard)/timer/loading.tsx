export default function TimerLoading() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse">
      <div className="mb-8 space-y-2">
        <div className="h-7 w-32 rounded-lg bg-white/8" />
        <div className="h-4 w-72 rounded-lg bg-white/5" />
      </div>
      <div className="h-14 rounded-2xl bg-white/5 border border-white/8 mb-5" />
      <div className="grid grid-cols-3 gap-2 mb-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-12 rounded-xl bg-white/5 border border-white/8" />
        ))}
      </div>
      <div className="flex flex-col items-center mb-8">
        <div className="w-72 h-72 rounded-full bg-white/5 border border-white/8" />
        <div className="flex gap-4 mt-6">
          <div className="w-12 h-12 rounded-2xl bg-white/5" />
          <div className="w-20 h-20 rounded-3xl bg-white/8" />
          <div className="w-12 h-12 rounded-2xl bg-white/5" />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="h-24 rounded-2xl bg-white/5 border border-white/8" />
        <div className="h-24 rounded-2xl bg-white/5 border border-white/8" />
      </div>
    </div>
  );
}
