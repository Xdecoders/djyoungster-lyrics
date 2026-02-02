export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading...</p>
      </div>
    </div>
  )
}
