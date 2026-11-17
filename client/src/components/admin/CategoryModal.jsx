import React, { useState, useEffect, useRef } from 'react';
import { X, Coffee, CupSoda, GlassWater, Cookie, Popcorn, Cake, Utensils, Sparkles } from 'lucide-react';
import { api } from '../../api/api';
import { useToast } from '../../context/ToastContext';

const availableIcons = [
  { name: 'Coffee', icon: Coffee },
  { name: 'CupSoda', icon: CupSoda },
  { name: 'GlassWater', icon: GlassWater },
  { name: 'Cookie', icon: Cookie },
  { name: 'Popcorn', icon: Popcorn },
  { name: 'Cake', icon: Cake },
  { name: 'Utensils', icon: Utensils },
  { name: 'Sparkles', icon: Sparkles }
];

export default function CategoryModal({ isOpen, onClose, categoryToEdit, onSaved }) {
  const { addToast } = useToast();
  const isEdit = !!categoryToEdit;

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAm, setDescriptionAm] = useState('');
  const [icon, setIcon] = useState('Coffee');
  const [displayOrder, setDisplayOrder] = useState('1');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const prevIsOpenRef = useRef(false);
  const prevEditIdRef = useRef(null);

  // Initialize form state ONLY when opening the modal or switching to a different category
  useEffect(() => {
    const isOpening = isOpen && !prevIsOpenRef.current;
    const currentEditId = categoryToEdit?.id ?? 'NEW_CATEGORY';
    const isSwitchingItem = isOpen && currentEditId !== prevEditIdRef.current;

    if (isOpening || isSwitchingItem) {
      if (categoryToEdit) {
        setName(categoryToEdit.name || '');
        setSlug(categoryToEdit.slug || '');
        setDescription(categoryToEdit.description || '');
        setDescriptionAm(categoryToEdit.description_am || '');
        setIcon(categoryToEdit.icon || 'Coffee');
        setDisplayOrder(categoryToEdit.display_order?.toString() || '1');
      } else {
        setName('');
        setSlug('');
        setDescription('');
        setDescriptionAm('');
        setIcon('Coffee');
        setDisplayOrder('1');
      }
      setError('');
    }

    prevIsOpenRef.current = isOpen;
    prevEditIdRef.current = isOpen ? currentEditId : null;
  }, [isOpen, categoryToEdit?.id]);

  if (!isOpen) return null;

  const handleNameChange = (val) => {
    setName(val);
    if (!isEdit) {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]+/g, '')
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        description_am: descriptionAm.trim(),
        icon,
        display_order: Number(displayOrder) || 1
      };

      if (isEdit) {
        await api.updateCategory(categoryToEdit.id, payload);
        addToast(`Updated category "${payload.name}"!`, 'success');
      } else {
        await api.createCategory(payload);
        addToast(`Created category "${payload.name}"!`, 'success');
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save category');
      addToast(err.message || 'Failed to save category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#1F1009] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border-t sm:border border-[#E8DFC8] dark:border-[#3A2012] max-h-[92vh] flex flex-col pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0 bg-[#FAF6F0] dark:bg-[#120804]">
          <div className="w-12 h-1.5 rounded-full bg-[#D7CCC8] dark:bg-[#3A2012]" />
        </div>

        {/* Header */}
        <div className="bg-[#FAF6F0] dark:bg-[#120804] border-b border-[#E8DFC8] dark:border-[#3A2012] p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D6E63] dark:text-[#D69E76]">
              {isEdit ? 'Update Category' : 'Create Category'}
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C1810] dark:text-[#FAF4ED]">
              {isEdit ? `Edit: ${categoryToEdit.name}` : 'Add New Category'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#A1887F] hover:text-[#2C1810] dark:hover:text-[#FAF4ED] hover:bg-[#EFEBE9] dark:hover:bg-[#2A170D] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-white dark:bg-[#1F1009] flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              Category Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Drinks, Snacks and Foods, Bakery"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 bg-white dark:bg-[#120804]"
            />
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="snacks-and-foods"
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] text-base sm:text-xs font-mono text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 bg-white dark:bg-[#120804]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                Display Order
              </label>
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 bg-white dark:bg-[#120804]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1.5">
              Select Category Icon
            </label>
            <div className="grid grid-cols-4 gap-2">
              {availableIcons.map((item) => {
                const Icon = item.icon;
                const isSelected = icon === item.name;
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setIcon(item.name)}
                    className={`flex flex-col items-center justify-center min-h-[56px] p-2.5 rounded-xl border text-xs font-medium transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-[#FFE082] dark:text-[#120804] border-[#3E2723] dark:border-[#D4AF37] shadow-xs'
                        : 'bg-[#FAF6F0] dark:bg-[#2A170D] hover:bg-[#EFEBE9] dark:hover:bg-[#3A2012] text-[#5D4037] dark:text-[#D69E76] border-[#E8DFC8] dark:border-[#3A2012]'
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of items in this category..."
              className="w-full p-3 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 resize-none bg-white dark:bg-[#120804]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              Amharic Description (አማርኛ - Optional)
            </label>
            <textarea
              rows={2}
              value={descriptionAm}
              onChange={(e) => setDescriptionAm(e.target.value)}
              placeholder="የምድቡ አጭር መግለጫ በአማርኛ..."
              className="w-full p-3 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 resize-none bg-white dark:bg-[#120804]"
            />
          </div>

          <div className="flex gap-2.5 pt-3 border-t border-[#F5EBE1] dark:border-[#3A2012]">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="flex-1 min-h-[48px] py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#5D4037] dark:text-[#FAF4ED] bg-[#FAF6F0] dark:bg-[#2A170D] hover:bg-[#EFEBE9] dark:hover:bg-[#3A2012] border border-[#D7CCC8] dark:border-[#3A2012] active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 min-h-[48px] py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white dark:text-[#120804] bg-[#3E2723] dark:bg-[#D4AF37] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-95 transition-all disabled:opacity-50 shadow-xs"
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
