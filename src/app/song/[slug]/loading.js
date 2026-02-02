export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {/* Breadcrumb skeleton */}
          <div className="flex gap-2 mb-6">
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content skeleton */}
            <div className="lg:col-span-2">
              {/* Header card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-44 h-44 sm:w-52 sm:h-52 bg-slate-200 dark:bg-slate-700 rounded-2xl mx-auto sm:mx-0"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="flex gap-2">
                      <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                      <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    </div>
                    <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="flex gap-3 pt-4">
                      <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                      <div className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                      <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lyrics card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6">
                <div className="h-6 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-6"></div>
                <div className="space-y-3">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" style={{ width: `${60 + Math.random() * 40}%` }}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-5">
                <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
