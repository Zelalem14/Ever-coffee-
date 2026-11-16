import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, CheckCircle2, AlertCircle, Coffee } from 'lucide-react';
import { api } from '../../api/api';
import { useMenu } from '../../context/MenuContext';
import { useToast } from '../../context/ToastContext';
import ProductModal from './ProductModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function AdminProductsTable() {
  const { products, categories, refreshData } = useMenu();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filter products for admin table
  const filtered = products.filter((p) => {
    if (selectedCat !== 'all') {
      if (p.category_id !== Number(selectedCat) && p.category_slug !== selectedCat) {
        return false;
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const handleToggleAvailability = async (product) => {
    try {
      await api.toggleProductAvailability(product.id);
      const newStatus = product.is_available === 1 ? 'Unavailable' : 'Available';
      addToast(`"${product.name}" marked as ${newStatus}`, 'success');
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to update availability', 'error');
    }
  };

  const handleOpenAdd = () => {
    setProductToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (product) => {
    setProductToDelete(product);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      setDeleting(true);
      await api.deleteProduct(productToDelete.id);
      addToast(`Deleted "${productToDelete.name}" successfully`, 'success');
      setDeleteModalOpen(false);
      setProductToDelete(null);
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to delete product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Action & Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-[#E8DFC8] shadow-xs space-y-3">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items by name..."
            className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-xl bg-[#FAF6F0] border border-[#D7CCC8] text-sm text-[#2C1810] placeholder:text-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
          />
        </div>

        {/* Category Filter & Add Button */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center justify-between gap-2.5">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="min-h-[44px] py-2 px-3 rounded-xl bg-[#FAF6F0] border border-[#D7CCC8] text-xs sm:text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 cursor-pointer font-medium"
          >
            <option value="all">All Items ({products.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.product_count || 0})
              </option>
            ))}
          </select>

          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#3E2723] hover:bg-[#2C1810] active:scale-95 shadow-xs transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Item</span>
          </button>
        </div>

      </div>

      {/* ================= MOBILE VIEW: TOUCH-FRIENDLY CARDS (block md:hidden) ================= */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-[#8D6E63] border border-[#E8DFC8]">
            No items found matching your filter.
          </div>
        ) : (
          filtered.map((product) => {
            const isAvail = product.is_available === 1;
            return (
              <div 
                key={product.id}
                className="bg-white rounded-2xl p-3.5 border border-[#E8DFC8] shadow-2xs space-y-3"
              >
                {/* Header: Thumbnail + Title + Price */}
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FAF6F0] shrink-0 border border-[#E8DFC8]">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className={`w-full h-full object-cover ${!isAvail ? 'opacity-50 grayscale' : ''}`}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#BCAAA4]">
                        <Coffee className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-serif font-bold text-base text-[#2C1810] leading-snug truncate">
                        {product.name}
                      </h4>
                      <div className="text-right shrink-0">
                        <span className="font-serif font-black text-base text-[#3E2723]">
                          {product.price_etb}
                        </span>
                        <span className="text-[10px] font-bold text-[#8D6E63] ml-0.5">
                          ETB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold text-[#4E342E] bg-[#EFEBE9] px-2 py-0.5 rounded-md">
                        {product.category_name}
                      </span>
                    </div>

                    {product.description && (
                      <p className="text-xs text-[#8D6E63] line-clamp-1 mt-1">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mobile Action Controls with min 44px touch targets */}
                <div className="pt-2.5 border-t border-[#F5EBE1] flex items-center justify-between gap-2">
                  
                  {/* Availability Toggle */}
                  <button
                    onClick={() => handleToggleAvailability(product)}
                    className={`flex-1 flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-xl text-xs font-semibold active:scale-95 transition-all ${
                      isAvail
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isAvail ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span>{isAvail ? 'In Stock' : 'Out of Stock'}</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#EFEBE9] text-[#4E342E] hover:bg-[#D7CCC8] active:scale-95 transition-colors border border-[#D7CCC8]/60"
                    title="Edit Item"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleOpenDelete(product)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-95 transition-colors border border-rose-200"
                    title="Delete Item"
                    aria-label={`Delete ${product.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ================= DESKTOP VIEW: FULL TABLE (hidden md:block) ================= */}
      <div className="hidden md:block bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8DFC8] bg-[#FAF6F0] text-[11px] font-bold uppercase tracking-wider text-[#8D6E63]">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Price (ETB)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EBE1] text-xs text-[#3E2723]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#8D6E63]">
                    No items found matching your filter.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const isAvail = product.is_available === 1;
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#FDFBF7] transition-colors"
                    >
                      {/* Item Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#FAF6F0] shrink-0 border border-[#E8DFC8]">
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className={`w-full h-full object-cover ${!isAvail ? 'opacity-50 grayscale' : ''}`}
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-[#2C1810] block text-sm">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-[#8D6E63] line-clamp-1 max-w-xs">
                              {product.description}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Section / Category */}
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium text-[#4E342E] bg-[#EFEBE9] px-2.5 py-1 rounded-md border border-[#D7CCC8]/60">
                          {product.category_name}
                        </span>
                      </td>

                      {/* Price in ETB */}
                      <td className="py-3 px-4 font-serif font-bold text-sm text-[#2C1810]">
                        {product.price_etb} <span className="text-[10px] text-[#8D6E63] font-sans font-semibold">ETB</span>
                      </td>

                      {/* Instant Toggle Availability */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleAvailability(product)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                            isAvail
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                          }`}
                          title="Click to toggle availability"
                        >
                          <span className={`w-2 h-2 rounded-full ${isAvail ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                          {isAvail ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="p-2 rounded-lg bg-[#EFEBE9] text-[#4E342E] hover:bg-[#D7CCC8] transition-colors"
                            title="Edit Item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(product)}
                            className="p-2 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={productToEdit}
        onSaved={refreshData}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Delete Item"
        message={`Are you sure you want to delete "${productToDelete?.name}" from the menu?`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        loading={deleting}
      />

    </div>
  );
}
