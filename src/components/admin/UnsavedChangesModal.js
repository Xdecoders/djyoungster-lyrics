'use client'

import { FiSave, FiTrash2, FiArrowLeft } from 'react-icons/fi'

export default function UnsavedChangesModal({ show, onSaveDraft, onDiscard, onCancel }) {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Unsaved Changes</h3>
        <p className="text-slate-600 text-sm mb-6">
          You have unsaved changes. What would you like to do?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onSaveDraft}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl hover:from-primary hover:to-emerald-700 transition font-medium text-sm flex items-center justify-center gap-2"
          >
            <FiSave className="w-4 h-4" />
            Save Draft & Leave
          </button>
          <button
            onClick={onDiscard}
            className="w-full px-4 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition font-medium text-sm flex items-center justify-center gap-2"
          >
            <FiTrash2 className="w-4 h-4" />
            Discard & Leave
          </button>
          <button
            onClick={onCancel}
            className="w-full px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition font-medium text-sm flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Stay on Page
          </button>
        </div>
      </div>
    </div>
  )
}
