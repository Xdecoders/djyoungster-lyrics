'use client'

import { useState, useRef, useEffect } from 'react'
import { FiSearch, FiX } from 'react-icons/fi'

export default function SearchableDropdown({
  items = [],
  selected = [],
  onSelect,
  onRemove,
  placeholder = 'Search...',
  displayKey = 'name',
  icon: Icon = null,
  renderItem = null,
  onCreate = null,
  createLabel = 'Create',
  maxItems = 10,
}) {
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filtered = items.filter(item =>
    item[displayKey].toLowerCase().includes(search.toLowerCase()) &&
    !selected.find(s => s.id === item.id)
  )

  const handleSelect = (item) => {
    onSelect(item)
    setSearch('')
    setShowDropdown(false)
  }

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selected.map(item => (
            <span
              key={item.id}
              className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
            >
              {item[displayKey]}
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="hover:text-red-500"
              >
                <FiX className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative" ref={containerRef}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setShowDropdown(true)
            }}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            placeholder={placeholder}
          />
        </div>

        {showDropdown && (search || filtered.length > 0) && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.slice(0, maxItems).map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  {Icon && <Icon className="w-4 h-4 text-gray-400" />}
                  {renderItem ? renderItem(item) : <span>{item[displayKey]}</span>}
                </button>
              ))
            ) : search && onCreate ? (
              <div className="px-4 py-3 text-sm text-gray-500">
                No results found.
                <button
                  type="button"
                  onClick={() => {
                    onCreate(search)
                    setShowDropdown(false)
                    setSearch('')
                  }}
                  className="text-primary hover:underline ml-1"
                >
                  {createLabel} &quot;{search}&quot;
                </button>
              </div>
            ) : search ? (
              <div className="px-4 py-3 text-sm text-gray-500">No results found.</div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
