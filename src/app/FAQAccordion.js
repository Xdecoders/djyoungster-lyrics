'use client'

import { useState } from 'react'
import { FiPlus, FiMinus } from 'react-icons/fi'

function FAQItem({ question, answer, index }) {
  const [open, setOpen] = useState(index === 0) // first item open by default

  return (
    <div
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        {/* Question is visible text — correct for Google */}
        <h3
          className="font-semibold text-slate-800 dark:text-white text-sm sm:text-base leading-snug"
        >
          {question}
        </h3>
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
          {open
            ? <FiMinus className="w-3.5 h-3.5 text-primary" />
            : <FiPlus  className="w-3.5 h-3.5 text-primary" />}
        </span>
      </button>

      {/* Answer — always in DOM for crawlers, CSS-animated for users */}
      <div
        className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p
          className="px-6 pb-5 pt-1 text-slate-600 dark:text-slate-300 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700"
        >
          {answer}
        </p>
      </div>
    </div>
  )
}

export default function FAQAccordion({ faqs }) {
  const left  = faqs.slice(0, 5)
  const right = faqs.slice(5, 10)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="flex flex-col gap-4">
        {left.map((faq, i) => (
          <FAQItem key={i} index={i} question={faq.question} answer={faq.answer} />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {right.map((faq, i) => (
          <FAQItem key={i + 5} index={i + 5} question={faq.question} answer={faq.answer} />
        ))}
      </div>
    </div>
  )
}
