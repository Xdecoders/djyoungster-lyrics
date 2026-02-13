import Link from 'next/link'
import { FiChevronRight, FiHome } from 'react-icons/fi'

export default function Breadcrumbs({ items }) {
  if (!items || items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center flex-wrap gap-1 text-sm text-slate-500 dark:text-slate-400">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.url || item.name} className="flex items-center gap-1">
              {index > 0 && (
                <FiChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
              )}
              {isLast ? (
                <span className="text-slate-700 dark:text-slate-200 font-medium truncate max-w-[200px]">
                  {index === 0 ? <FiHome className="w-3.5 h-3.5 inline -mt-0.5" /> : null}
                  {index === 0 ? null : item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-primary dark:hover:text-emerald-400 transition-colors truncate max-w-[200px]"
                >
                  {index === 0 ? (
                    <FiHome className="w-3.5 h-3.5 inline -mt-0.5" />
                  ) : (
                    item.name
                  )}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
