import React, { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon } from 'lucide-react';
import { api } from '../../api/api';
import { useMenu } from '../../context/MenuContext';
import { useToast } from '../../context/ToastContext';

export default function ProductModal({ isOpen, onClose, productToEdit, onSaved }) {
  const { categories } = useMenu();
  const { addToast } = useToast();

  const isEdit = !!productToEdit;

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priceEtb, setPriceEtb] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionAm, setDescriptionAm] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const [imageMode, setImageMode] = useState('upload'); // 'upload' or 'url'
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setCategoryId(productToEdit.category_id || (categories[0]?.id || ''));
      setPriceEtb(productToEdit.price_etb?.toString() || '');
      setDescription(productToEdit.description || '');
      setDescriptionAm(productToEdit.description_am || '');
      setImageUrl(productToEdit.image_url || '');
      setIsAvailable(productToEdit.is_available === 1);
    } else {
      setName('');
      setCategoryId(categories[0]?.id || '');
      setPriceEtb('');
      setDescription('');
      setDescriptionAm('');
      setImageUrl('');
      setIsAvailable(true);
    }
    setError('');
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await api.uploadImage(file);
      setImageUrl(res.url);
      addToast('Image uploaded successfully!', 'success');
    } catch (err) {
      setError(err.message || 'Image upload failed');
      addToast(err.message || 'Image upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Item name is required');
      return;
    }
    if (!categoryId) {
      setError('Please select a category (Drinks or Foods & Snacks)');
      return;
    }
    if (!priceEtb || isNaN(Number(priceEtb)) || Number(priceEtb) < 0) {
      setError('Please enter a valid price in Ethiopian Birr (ETB)');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: name.trim(),
        category_id: Number(categoryId),
        price_etb: Number(priceEtb),
        description: description.trim(),
        description_am: descriptionAm.trim(),
        image_url: imageUrl.trim() || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
        is_available: isAvailable ? 1 : 0
      };

      if (isEdit) {
        await api.updateProduct(productToEdit.id, payload);
        addToast(`Updated "${payload.name}" successfully!`, 'success');
      } else {
        await api.createProduct(payload);
        addToast(`Added "${payload.name}" to menu!`, 'success');
      }

      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save item');
      addToast(err.message || 'Failed to save item', 'error');
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
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C1810] dark:text-[#FAF4ED]">
              {isEdit ? `Edit: ${productToEdit.name}` : 'Add New Menu Item'}
            </h3>
            <p className="text-xs text-[#8D6E63] dark:text-[#A89080]">
              Configure item name, price (ETB), category, and image
            </p>
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

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Buna, Macchiato, Sun Chips"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#120804] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                Menu Section *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] bg-white dark:bg-[#120804] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
              >
                <option value="">Select Section</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                Price (ETB) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  required
                  value={priceEtb}
                  onChange={(e) => setPriceEtb(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full min-h-[44px] pl-3.5 pr-14 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#120804] text-base sm:text-sm font-semibold text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8D6E63] dark:text-[#D69E76] pointer-events-none">
                  ETB
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this coffee drink or snack..."
              className="w-full p-3 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#120804] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 resize-none"
            />
          </div>

          {/* Amharic Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              Amharic Description (አማርኛ - Optional)
            </label>
            <textarea
              rows={2}
              value={descriptionAm}
              onChange={(e) => setDescriptionAm(e.target.value)}
              placeholder="የመጠጡ ወይም የምግቡ አጭር መግለጫ በአማርኛ..."
              className="w-full p-3 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#120804] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 resize-none"
            />
          </div>

          {/* Picture Upload / URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76]">
                Product Picture
              </label>
              <div className="flex items-center gap-1 bg-[#FAF6F0] dark:bg-[#2A170D] p-1 rounded-lg border border-[#E8DFC8] dark:border-[#3A2012]">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`min-h-[32px] px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    imageMode === 'upload' ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-2xs' : 'text-[#8D6E63] dark:text-[#A89080]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`min-h-[32px] px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    imageMode === 'url' ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-2xs' : 'text-[#8D6E63] dark:text-[#A89080]'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {imageMode === 'upload' ? (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[#D7CCC8] dark:border-[#3A2012] rounded-xl hover:border-[#8D6E63] hover:bg-[#FAF6F0] dark:hover:bg-[#2A170D] cursor-pointer transition-colors min-h-[90px]">
                <Upload className="w-5 h-5 text-[#8D6E63] dark:text-[#D69E76] mb-1" />
                <span className="text-xs font-medium text-[#5D4037] dark:text-[#FAF4ED]">
                  {uploading ? 'Uploading image...' : 'Tap to take photo or choose file'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            ) : (
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#120804] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
              />
            )}

            {/* Thumbnail preview */}
            {imageUrl && (
              <div className="flex items-center gap-3 p-2 bg-[#FAF6F0] dark:bg-[#2A170D] rounded-xl border border-[#E8DFC8] dark:border-[#3A2012]">
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded-lg border border-[#D7CCC8] dark:border-[#3A2012]"
                />
                <span className="text-xs text-[#8D6E63] dark:text-[#A89080] truncate flex-1">
                  Image selected
                </span>
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-xs text-rose-600 dark:text-rose-400 hover:underline min-h-[36px] px-2 flex items-center"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Availability Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-[#FAF6F0] dark:bg-[#2A170D] rounded-xl border border-[#E8DFC8] dark:border-[#3A2012] cursor-pointer min-h-[48px]">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-5 h-5 rounded text-[#3E2723] dark:text-[#D4AF37] focus:ring-[#8D6E63]"
              />
              <span className="text-xs sm:text-sm font-semibold text-[#2C1810] dark:text-[#FAF4ED]">
                Available / In Stock for customers
              </span>
            </label>
          </div>

          {/* Action Buttons with 48px touch targets */}
          <div className="pt-4 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[48px] py-3 rounded-xl text-xs sm:text-sm font-semibold text-[#5D4037] dark:text-[#FAF4ED] bg-[#FAF6F0] dark:bg-[#2A170D] hover:bg-[#EFEBE9] dark:hover:bg-[#3A2012] border border-[#D7CCC8] dark:border-[#3A2012] active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex-1 min-h-[48px] py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#3E2723] dark:bg-[#D4AF37] dark:text-[#120804] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-95 disabled:opacity-50 transition-all shadow-xs"
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Item' : 'Add Item to Menu'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
