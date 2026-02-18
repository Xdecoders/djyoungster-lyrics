'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { FiBold, FiItalic, FiLink, FiCornerUpLeft, FiCornerUpRight } from 'react-icons/fi'

export default function RichTextEditor({ value, onChange, placeholder, rows = 10 }) {
  const editorRef = useRef(null)
  const isInternalChange = useRef(false)
  const [activeFormats, setActiveFormats] = useState({ bold: false, italic: false, link: false })

  // Set initial content
  useEffect(() => {
    if (editorRef.current && !isInternalChange.current) {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || ''
      }
    }
  }, [value])

  const updateActiveFormats = useCallback(() => {
    setActiveFormats({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      link: !!window.getSelection()?.focusNode?.parentElement?.closest('a'),
    })
  }, [])

  const handleInput = useCallback(() => {
    if (!editorRef.current) return
    isInternalChange.current = true
    const html = editorRef.current.innerHTML
    const isEmpty = html === '<br>' || html === '' || html === '<div><br></div>'
    onChange?.(isEmpty ? '' : html)
    updateActiveFormats()
    setTimeout(() => { isInternalChange.current = false }, 0)
  }, [onChange, updateActiveFormats])

  const execCommand = useCallback((command, val = null) => {
    editorRef.current?.focus()
    document.execCommand(command, false, val)
    handleInput()
  }, [handleInput])

  const toggleBold = useCallback(() => execCommand('bold'), [execCommand])
  const toggleItalic = useCallback(() => execCommand('italic'), [execCommand])

  const setLink = useCallback(() => {
    const selection = window.getSelection()
    const anchor = selection?.focusNode?.parentElement?.closest('a')
    const previousUrl = anchor?.href || ''
    const url = window.prompt('Enter URL:', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      execCommand('unlink')
    } else {
      execCommand('createLink', url)
      // Set target and rel on newly created link
      const newAnchor = window.getSelection()?.focusNode?.parentElement?.closest('a')
      if (newAnchor) {
        newAnchor.target = '_blank'
        newAnchor.rel = 'noopener noreferrer'
        newAnchor.className = 'text-primary underline'
      }
      handleInput()
    }
  }, [execCommand, handleInput])

  const handlePaste = useCallback((e) => {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    if (!text) return

    // Convert plain text line breaks to <br> tags to preserve lyrics formatting
    const html = text
      .split('\n')
      .map(line => line || '<br>')
      .join('<br>')

    document.execCommand('insertHTML', false, html)
    handleInput()
  }, [handleInput])

  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); toggleBold() }
      if (e.key === 'i') { e.preventDefault(); toggleItalic() }
      if (e.key === 'z') { e.preventDefault(); execCommand('undo') }
      if (e.key === 'y') { e.preventDefault(); execCommand('redo') }
    }
  }, [toggleBold, toggleItalic, execCommand])

  return (
    <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        <button
          type="button"
          onClick={toggleBold}
          className={`p-1.5 rounded hover:bg-gray-200 transition ${
            activeFormats.bold ? 'bg-gray-200 text-primary' : 'text-gray-600'
          }`}
          title="Bold (Ctrl+B)"
        >
          <FiBold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={toggleItalic}
          className={`p-1.5 rounded hover:bg-gray-200 transition ${
            activeFormats.italic ? 'bg-gray-200 text-primary' : 'text-gray-600'
          }`}
          title="Italic (Ctrl+I)"
        >
          <FiItalic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={setLink}
          className={`p-1.5 rounded hover:bg-gray-200 transition ${
            activeFormats.link ? 'bg-gray-200 text-primary' : 'text-gray-600'
          }`}
          title="Link"
        >
          <FiLink className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button
          type="button"
          onClick={() => execCommand('undo')}
          className="p-1.5 rounded hover:bg-gray-200 transition text-gray-600"
          title="Undo (Ctrl+Z)"
        >
          <FiCornerUpLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand('redo')}
          className="p-1.5 rounded hover:bg-gray-200 transition text-gray-600"
          title="Redo (Ctrl+Y)"
        >
          <FiCornerUpRight className="w-4 h-4" />
        </button>
      </div>
      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onSelect={updateActiveFormats}
        onClick={updateActiveFormats}
        data-placeholder={placeholder || 'Start typing...'}
        className="prose prose-sm max-w-none focus:outline-none px-4 py-2 font-mono empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 empty:before:pointer-events-none"
        style={{ minHeight: `${rows * 1.5}em` }}
      />
    </div>
  )
}
