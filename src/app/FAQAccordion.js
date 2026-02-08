'use client'

import { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'

function FAQItem({ question, answer }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        aria-expanded={isOpen}
      >
        <span className="font-medium text-slate-800 dark:text-white text-sm sm:text-base pr-4">{question}</span>
        <FiChevronDown className={`w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQAccordion({ faqs }) {
  return (
    <>
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </>
  )
}
