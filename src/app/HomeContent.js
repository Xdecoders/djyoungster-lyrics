import LatestUpdatesSection from './LatestUpdatesSection'

export default function HomeContent({ data }) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="fixed inset-0 -z-10 bg-[#f8fafc] dark:bg-slate-900" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <LatestUpdatesSection posts={data.recentBlogPosts} />
      </main>
    </div>
  )
}
