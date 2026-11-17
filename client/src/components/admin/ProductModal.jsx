import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Link as LinkIcon, CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, Trash2, RefreshCw } from 'lucide-react';
import { api } from '../../api/api';
import { useMenu } from '../../context/MenuContext';
import { useToast } from '../../context/ToastContext';
import { validateClientImage, compressImage, formatFileSize } from '../../utils/imageCompressor';

export default function ProductModal({ isOpen, onClose, productToEdit, onSaved }) {
  const { categories, upsertProduct } = useMenu();
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
  const [uploadStatus, setUploadStatus] = useState('');
  const [localPreviewUrl, setLocalPreviewUrl] = useState('');
  const [detectedFormat, setDetectedFormat] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);
  const prevIsOpenRef = useRef(false);
  const prevEditIdRef = useRef(null);

  // Initialize or reset form ONLY on modal open transition or switching the edited product
  useEffect(() => {
    const isOpening = isOpen && !prevIsOpenRef.current;
    const currentEditId = productToEdit?.id ?? 'NEW_PRODUCT';
    const isSwitchingItem = isOpen && currentEditId !== prevEditIdRef.current;

    if (isOpening || isSwitchingItem) {
      if (productToEdit) {
        setName(productToEdit.name || '');
        setCategoryId(productToEdit.category_id != null ? String(productToEdit.category_id) : (categories[0]?.id ? String(categories[0].id) : ''));
        setPriceEtb(productToEdit.price_etb != null ? String(productToEdit.price_etb) : '');
        setDescription(productToEdit.description || '');
        setDescriptionAm(productToEdit.description_am || '');
        setImageUrl(productToEdit.image_url || '');
        setIsAvailable(productToEdit.is_available === 1);
      } else {
        setName('');
        setCategoryId(categories[0]?.id ? String(categories[0].id) : '');
        setPriceEtb('');
        setDescription('');
        setDescriptionAm('');
        setImageUrl('');
        setIsAvailable(true);
      }
      setError('');
      setUploadStatus('');
      setLocalPreviewUrl('');
      setDetectedFormat('');
    }

    prevIsOpenRef.current = isOpen;
    prevEditIdRef.current = isOpen ? currentEditId : null;
  }, [isOpen, productToEdit?.id]);

  // If adding a new item and categories load asynchronously for the first time, only default categoryId if empty
  useEffect(() => {
    if (isOpen && !productToEdit && !categoryId && categories.length > 0) {
      setCategoryId(String(categories[0].id));
    }
  }, [isOpen, productToEdit, categoryId, categories]);

  // Clean up any object URL when unmounting or switching previews
  useEffect(() => {
    return () => {
      if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  if (!isOpen) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploadStatus('Verifying image file signature...');

    // 1. Client-side magic byte & size validation
    const validation = await validateClientImage(file);
    if (!validation.valid) {
      setError(validation.error);
      addToast(validation.error, 'error');
      setUploadStatus('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setDetectedFormat(validation.format);

    // 2. Generate instant client-side preview URL
    const preview = URL.createObjectURL(file);
    setLocalPreviewUrl(preview);

    try {
      setUploading(true);
      setUploadStatus(`Optimizing ${validation.format} (${formatFileSize(file.size)})...`);

      // 3. Compress large images (mobile camera shots) while preserving quality
      const compressionResult = await compressImage(file, 1600, 0.88);
      const fileToUpload = compressionResult.file;

      if (compressionResult.compressed) {
        setUploadStatus(`Uploading compressed ${validation.format} (${formatFileSize(fileToUpload.size)} - saved ${compressionResult.savedPercent})...`);
      } else {
        setUploadStatus(`Uploading ${validation.format} (${formatFileSize(fileToUpload.size)})...`);
      }

      // 4. Send to server backend with persistent SQLite + disk storage
      const res = await api.uploadImage(fileToUpload);
      setImageUrl(res.url);
      setUploadStatus('Image stored permanently!');
      addToast(`Image uploaded successfully (${validation.format})!`, 'success');
    } catch (err) {
      setError(err.message || 'Image upload failed');
      addToast(err.message || 'Image upload failed', 'error');
      setLocalPreviewUrl('');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    if (localPreviewUrl && localPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(localPreviewUrl);
    }
    setLocalPreviewUrl('');
    setUploadStatus('');
    setDetectedFormat('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        const updated = await api.updateProduct(productToEdit.id, payload);
        if (updated) {
          upsertProduct(updated);
        }
        addToast(`Updated "${payload.name}" successfully!`, 'success');
      } else {
        const created = await api.createProduct(payload);
        if (created) {
          upsertProduct(created);
        }
        addToast(`Added "${payload.name}" to menu!`, 'success');
      }

      if (onSaved) {
        await onSaved();
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save item');
      addToast(err.message || 'Failed to save item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const activeImage = localPreviewUrl || imageUrl;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-[#1F1009] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border-t sm:border border-zinc-200 dark:border-[#3A2012] max-h-[92vh] flex flex-col pb-safe transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0 bg-zinc-50 dark:bg-[#120804]">
          <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-[#3A2012]" />
        </div>

        {/* Header */}
        <div className="bg-zinc-50 dark:bg-[#120804] border-b border-zinc-200 dark:border-[#3A2012] p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-zinc-900 dark:text-[#FAF4ED]">
              {isEdit ? `Edit: ${productToEdit.name}` : 'Add New Menu Item'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-[#A89080]">
              Configure item name, price (ETB), category, and image
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-[#FAF4ED] hover:bg-zinc-100 dark:hover:bg-[#2A170D] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto bg-white dark:bg-[#1F1009] flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Name */}
          <div>
            <label htmlFor="admin-item-name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-[#D69E76] mb-1">
              Item Name *
            </label>
            <input
              id="admin-item-name"
              name="itemName"
              type="text"
              required
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Buna, Macchiato, Sun Chips"
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-[#3A2012] bg-zinc-50 dark:bg-[#120804] text-base sm:text-sm text-zinc-900 dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
            />
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label htmlFor="admin-item-category" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-[#D69E76] mb-1">
                Menu Section *
              </label>
              <select
                id="admin-item-category"
                name="categoryId"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-[#3A2012] text-base sm:text-sm text-zinc-900 dark:text-[#FAF4ED] bg-zinc-50 dark:bg-[#120804] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
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
              <label htmlFor="admin-item-price" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-[#D69E76] mb-1">
                Price (ETB) *
              </label>
              <div className="relative">
                <input
                  id="admin-item-price"
                  name="priceEtb"
                  type="number"
                  inputMode="decimal"
                  step="any"
                  min="0"
                  required
                  value={priceEtb}
                  onChange={(e) => setPriceEtb(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full min-h-[44px] pl-3.5 pr-14 py-2.5 rounded-xl border border-zinc-200 dark:border-[#3A2012] bg-zinc-50 dark:bg-[#120804] text-base sm:text-sm font-semibold text-zinc-900 dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-500 dark:text-[#D69E76] pointer-events-none">
                  ETB
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="admin-item-description" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-[#D69E76] mb-1">
              Description (Optional)
            </label>
            <textarea
              id="admin-item-description"
              name="description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description of this coffee drink or snack..."
              className="w-full p-3 rounded-xl border border-zinc-200 dark:border-[#3A2012] bg-zinc-50 dark:bg-[#120804] text-base sm:text-sm text-zinc-900 dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 resize-none"
            />
          </div>

          {/* Amharic Description */}
          <div>
            <label htmlFor="admin-item-description-am" className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-[#D69E76] mb-1">
              Amharic Description (አማርኛ - Optional)
            </label>
            <textarea
              id="admin-item-description-am"
              name="descriptionAm"
              rows={2}
              value={descriptionAm}
              onChange={(e) => setDescriptionAm(e.target.value)}
              placeholder="የመጠጡ ወይም የምግቡ አጭር መግለጫ በአማርኛ..."
              className="w-full p-3 rounded-xl border border-zinc-200 dark:border-[#3A2012] bg-zinc-50 dark:bg-[#120804] text-base sm:text-sm text-zinc-900 dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 resize-none"
            />
          </div>

          {/* Picture Upload / URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-[#D69E76]">
                Product Picture
              </label>
              <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#2A170D] p-1 rounded-lg border border-zinc-200 dark:border-[#3A2012]">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`min-h-[32px] px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    imageMode === 'upload' ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-2xs' : 'text-zinc-600 dark:text-[#A89080]'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`min-h-[32px] px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    imageMode === 'url' ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-2xs' : 'text-zinc-600 dark:text-[#A89080]'
                  }`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {/* Hidden file input supporting all formats across Mobile & Desktop */}
            <input
              id="admin-image-upload-input"
              ref={fileInputRef}
              type="file"
              accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.svg,.heic,.heif,.tiff,.tif"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />

            {imageMode === 'upload' ? (
              activeImage ? (
                /* Enhanced Image Preview Card */
                <div className="p-3 bg-zinc-50 dark:bg-[#2A170D] rounded-2xl border border-zinc-200 dark:border-[#3A2012] flex items-center gap-3.5">
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-zinc-200 dark:border-[#3A2012] bg-zinc-100 shrink-0">
                    <img
                      src={activeImage}
                      alt="Selected Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{detectedFormat ? `${detectedFormat} Preview Ready` : 'Image Ready'}</span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-[#A89080] truncate mt-0.5">
                      {uploadStatus || (imageUrl.startsWith('/uploads') ? 'Permanently stored in system' : 'Ready to save')}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="text-xs font-semibold text-[#3E2723] dark:text-[#D4AF37] hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Replace
                      </button>
                      <span className="text-zinc-300 dark:text-[#5D4037]">|</span>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        disabled={uploading}
                        className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Upload Dropzone */
                <label
                  htmlFor="admin-image-upload-input"
                  className={`flex flex-col items-center justify-center p-5 border-2 border-dashed border-zinc-300 dark:border-[#3A2012] rounded-2xl hover:border-[#8D6E63] dark:hover:border-[#D4AF37] hover:bg-zinc-50 dark:hover:bg-[#2A170D] cursor-pointer transition-all min-h-[110px] text-center ${
                    uploading ? 'opacity-60 pointer-events-none' : ''
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 text-[#8D6E63] dark:text-[#D4AF37] animate-spin mb-2" />
                      <span className="text-xs font-semibold text-zinc-900 dark:text-[#FAF4ED]">
                        {uploadStatus || 'Processing image...'}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-[#A89080] mt-0.5">
                        Optimizing quality & saving permanently
                      </span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-zinc-400 dark:text-[#D69E76] mb-1.5" />
                      <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-[#FAF4ED]">
                        Tap to choose photo or upload file
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-[#A89080] mt-0.5">
                        Supports JPG, PNG, WEBP, GIF, BMP, SVG, HEIC, TIFF (Max 10MB)
                      </span>
                    </>
                  )}
                </label>
              )
            ) : (
              /* Direct URL Input Mode */
              <div className="space-y-2">
                <input
                  id="admin-item-image-url"
                  name="imageUrl"
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-[#3A2012] bg-zinc-50 dark:bg-[#120804] text-base sm:text-sm text-zinc-900 dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                />
                {imageUrl && (
                  <div className="flex items-center gap-3 p-2 bg-zinc-50 dark:bg-[#2A170D] rounded-xl border border-zinc-200 dark:border-[#3A2012]">
                    <img
                      src={imageUrl}
                      alt="URL Preview"
                      className="w-12 h-12 object-cover rounded-lg border border-zinc-200 dark:border-[#3A2012]"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <span className="text-xs text-zinc-500 dark:text-[#A89080] truncate flex-1">
                      URL preview loaded
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
            )}
          </div>

          {/* Availability Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-[#2A170D] rounded-xl border border-zinc-200 dark:border-[#3A2012] cursor-pointer min-h-[48px]">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                className="w-5 h-5 rounded text-[#3E2723] dark:text-[#D4AF37] focus:ring-[#8D6E63]"
              />
              <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-[#FAF4ED]">
                Available / In Stock for customers
              </span>
            </label>
          </div>

          {/* Action Buttons with 48px touch targets */}
          <div className="pt-4 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 min-h-[48px] py-3 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 dark:text-[#FAF4ED] bg-zinc-100 dark:bg-[#2A170D] hover:bg-zinc-200 dark:hover:bg-[#3A2012] border border-zinc-200 dark:border-[#3A2012] active:scale-95 transition-all"
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
