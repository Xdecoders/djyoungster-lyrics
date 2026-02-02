export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="w-44 h-44 sm:w-52 sm:h-52 bg-slate-200 dark:bg-slate-700 rounded-2xl mx-auto sm:mx-0"></div>
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded mx-auto sm:mx-0"></div>
                <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mx-auto sm:mx-0"></div>
                <div className="flex gap-4 justify-center sm:justify-start">
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Songs grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
