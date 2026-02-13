'use client'

import { useState, useRef } from 'react'
import { FiUpload, FiLink, FiImage, FiX } from 'react-icons/fi'

export default function ImageUploader({ value = '', onChange, onClear }) {
  const [mode, setMode] = useState('url')
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(value || '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(selected.type)) {
      alert('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.')
      return
    }

    if (selected.size > 5 * 1024 * 1024) {
      alert('File too large. Maximum size is 5MB.')
      return
    }

    setFile(selected)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(selected)
  }

  const handleFileUpload = async () => {
    if (!file) return
    setUploading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      const data = await res.json()

      if (res.ok) {
        onChange(data.url)
        setPreview(data.url)
        alert('Image uploaded successfully!')
      } else {
        alert(data.message || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Something went wrong while uploading')
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadFromUrl = async () => {
    const url = value?.trim()
    if (!url) {
      alert('Please enter an image URL')
      return
    }
    setUploading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/admin/upload-from-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ url })
      })
      const data = await res.json()

      if (res.ok) {
        onChange(data.url)
        setPreview(data.url)
        alert('Image downloaded and saved successfully!')
      } else {
        alert(data.message || 'Failed to download image')
      }
    } catch (error) {
      console.error('Error downloading image:', error)
      alert('Something went wrong while downloading')
    } finally {
      setUploading(false)
    }
  }

  const handleClear = () => {
    setFile(null)
    setPreview('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (onClear) onClear()
  }

  return (
    <div>
      {/* Upload Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode('file')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
            mode === 'file'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <FiUpload className="w-5 h-5" />
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode('url')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition ${
            mode === 'url'
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-gray-200 text-gray-600 hover:border-gray-300'
          }`}
        >
          <FiLink className="w-5 h-5" />
          From URL
        </button>
      </div>

      {/* File Upload Mode */}
      {mode === 'file' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileSelect}
              className="hidden"
              id="imageUploaderFile"
            />
            <label htmlFor="imageUploaderFile" className="cursor-pointer">
              <FiUpload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">Click to choose a file</p>
              <p className="text-sm text-gray-400 mt-1">JPEG, PNG, WebP, GIF (max 5MB)</p>
            </label>
          </div>

          {file && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FiImage className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600 flex-1 truncate">{file.name}</span>
              <button
                type="button"
                onClick={handleFileUpload}
                disabled={uploading}
                className="px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-hover transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 text-gray-400 hover:text-red-500 transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* URL Mode */}
      {mode === 'url' && (
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="https://example.com/image.jpg"
            />
            <button
              type="button"
              onClick={handleDownloadFromUrl}
              disabled={uploading || !value}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FiUpload className="w-4 h-4" />
                  Save
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Enter image URL and click Save to download to server</p>
        </div>
      )}

      {/* Image Preview */}
      {(preview || value) && (
        <div className="mt-4 relative">
          <p className="text-sm text-gray-500 mb-2">Preview:</p>
          <div className="relative inline-block">
            <img
              src={preview || value}
              alt="Cover preview"
              className="w-40 h-40 object-cover rounded-lg border border-gray-200"
              onError={(e) => { e.target.style.display = 'none' }}
            />
            <button
              type="button"
              onClick={handleClear}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
