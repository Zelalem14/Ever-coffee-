import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDeleteModal({ isOpen, title, message, onConfirm, onCancel, loading }) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onCancel}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border-t sm:border border-rose-200 p-5 sm:p-6 pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden -mt-1 pb-2 flex justify-center">
          <div className="w-12 h-1.5 rounded-full bg-[#D7CCC8]" />
        </div>

        <div className="flex items-center gap-3.5 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C1810]">
              {title || 'Confirm Deletion'}
            </h3>
            <p className="text-xs text-[#8D6E63] mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#5D4037] leading-relaxed mb-5">
          {message || 'Are you sure you want to delete this item?'}
        </p>

        <div className="flex gap-2.5 pt-2 border-t border-[#F5EBE1]">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="flex-1 min-h-[48px] py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#5D4037] bg-[#FAF6F0] hover:bg-[#EFEBE9] border border-[#D7CCC8] active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="flex-1 min-h-[48px] py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-xs disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>

      </div>
    </div>
  );
}
