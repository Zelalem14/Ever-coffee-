import React, { useState, useMemo } from 'react';
import { Plus, Search, Edit3, Trash2, Coffee, CheckCircle2, XCircle } from 'lucide-react';
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

  // Quick category counts
  const counts = useMemo(() => {
    let drinks = 0;
    let foods = 0;
    products.forEach((p) => {
      const slug = (p.category_slug || '').toLowerCase();
      const name = (p.category_name || '').toLowerCase();
      if (slug.includes('drink') || slug.includes('coffee') || slug.includes('tea') || name.includes('drink')) {
        drinks++;
      } else {
        foods++;
      }
    });
    return { all: products.length, drinks, foods };
  }, [products]);

  // Filter products for admin table
  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCat !== 'all') {
        const slug = (p.category_slug || '').toLowerCase();
        const name = (p.category_name || '').toLowerCase();
        const isDrink = slug.includes('drink') || slug.includes('coffee') || slug.includes('tea') || name.includes('drink');
        if (selectedCat === 'drinks' && !isDrink) return false;
        if (selectedCat === 'foods' && isDrink) return false;
        if (typeof selectedCat === 'number' && p.category_id !== selectedCat) return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchDescAm = (p.description_am || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchDescAm) return false;
      }
      return true;
    });
  }, [products, selectedCat, search]);

  const handleToggleAvailability = async (product) => {
    try {
      await api.toggleProductAvailability(product.id);
      const newStatus = product.is_available === 1 ? 'Out of Stock' : 'In Stock';
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
    <div className="space-y-4 sm:space-y-6">
      
      {/* Top Header Card: Search, Category Filter Pills, & Add Item Button */}
      <div className="bg-white dark:bg-[#1F1009] p-4 sm:p-5 rounded-2xl border border-[#E8DFC8] dark:border-[#3A2012] shadow-xs space-y-3.5">
        
        {/* Row 1: Search & Add Item */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search items by name or description..."
              className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-xl bg-[#FAF6F0] dark:bg-[#120804] border border-[#D7CCC8] dark:border-[#3A2012] text-sm text-[#2C1810] dark:text-[#FAF4ED] placeholder:text-[#A1887F] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
            />
          </div>

          {/* Add New Item Button */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white dark:text-[#120804] bg-[#3E2723] dark:bg-[#D4AF37] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-95 shadow-xs transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Menu Item</span>
          </button>
        </div>

        {/* Row 2: Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#E8DFC8]/50 dark:border-[#3A2012]/60">
          <span className="text-xs font-semibold text-[#8D6E63] dark:text-[#D69E76] mr-1">
            Category:
          </span>

          <button
            onClick={() => setSelectedCat('all')}
            className={`min-h-[36px] px-3.5 py-1 rounded-xl text-xs font-semibold transition-all ${
              selectedCat === 'all'
                ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-2xs'
                : 'bg-[#FAF6F0] dark:bg-[#120804] text-[#5D4037] dark:text-[#D69E76] hover:bg-[#EFEBE9] dark:hover:bg-[#2A170D] border border-[#D7CCC8] dark:border-[#3A2012]'
            }`}
          >
            All Items ({counts.all})
          </button>

          <button
            onClick={() => setSelectedCat('drinks')}
            className={`min-h-[36px] px-3.5 py-1 rounded-xl text-xs font-semibold transition-all ${
              selectedCat === 'drinks'
                ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-2xs'
                : 'bg-[#FAF6F0] dark:bg-[#120804] text-[#5D4037] dark:text-[#D69E76] hover:bg-[#EFEBE9] dark:hover:bg-[#2A170D] border border-[#D7CCC8] dark:border-[#3A2012]'
            }`}
          >
            Drinks ({counts.drinks})
          </button>

          <button
            onClick={() => setSelectedCat('foods')}
            className={`min-h-[36px] px-3.5 py-1 rounded-xl text-xs font-semibold transition-all ${
              selectedCat === 'foods'
                ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-2xs'
                : 'bg-[#FAF6F0] dark:bg-[#120804] text-[#5D4037] dark:text-[#D69E76] hover:bg-[#EFEBE9] dark:hover:bg-[#2A170D] border border-[#D7CCC8] dark:border-[#3A2012]'
            }`}
          >
            Foods & Snacks ({counts.foods})
          </button>
        </div>

      </div>

      {/* ================= MOBILE VIEW: TOUCH-FRIENDLY PRODUCT CARDS (block md:hidden) ================= */}
      <div className="block md:hidden space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-[#1F1009] rounded-2xl p-8 text-center text-[#8D6E63] dark:text-[#A89080] border border-[#E8DFC8] dark:border-[#3A2012]">
            No menu items found. Tap &quot;Add New Menu Item&quot; to create one.
          </div>
        ) : (
          filtered.map((product) => {
            const isAvail = product.is_available === 1;
            return (
              <div 
                key={product.id}
                className="bg-white dark:bg-[#1F1009] rounded-2xl p-3.5 border border-[#E8DFC8] dark:border-[#3A2012] shadow-2xs space-y-3"
              >
                {/* Header: Picture + Title + Price */}
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#FAF6F0] dark:bg-[#2A170D] shrink-0 border border-[#E8DFC8] dark:border-[#3A2012]">
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
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
                      <h4 className="font-serif font-bold text-base text-[#2C1810] dark:text-[#FAF4ED] leading-snug truncate">
                        {product.name}
                      </h4>
                      <div className="text-right shrink-0">
                        <span className="font-serif font-black text-base text-[#3E2723] dark:text-[#D4AF37]">
                          {product.price_etb}
                        </span>
                        <span className="text-[10px] font-bold text-[#8D6E63] dark:text-[#A89080] ml-0.5">
                          ETB
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold text-[#4E342E] dark:text-[#D69E76] bg-[#EFEBE9] dark:bg-[#2A170D] px-2 py-0.5 rounded-md">
                        {product.category_name}
                      </span>
                    </div>

                    {product.description && (
                      <p className="text-xs text-[#8D6E63] dark:text-[#A89080] line-clamp-1 mt-1">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mobile Action Controls with min 44px touch targets */}
                <div className="pt-2.5 border-t border-[#F5EBE1] dark:border-[#3A2012] flex items-center justify-between gap-2">
                  
                  {/* Stock Availability Toggle */}
                  <button
                    onClick={() => handleToggleAvailability(product)}
                    className={`flex-1 flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-xl text-xs font-semibold active:scale-95 transition-all ${
                      isAvail
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isAvail ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <span>{isAvail ? 'In Stock' : 'Out of Stock'}</span>
                  </button>

                  {/* Edit Button */}
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#EFEBE9] dark:bg-[#2A170D] text-[#4E342E] dark:text-[#FAF4ED] hover:bg-[#D7CCC8] active:scale-95 transition-colors border border-[#D7CCC8]/60 dark:border-[#3A2012]"
                    title="Edit Menu Item"
                    aria-label={`Edit ${product.name}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleOpenDelete(product)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 active:scale-95 transition-colors border border-rose-200 dark:border-rose-900"
                    title="Delete Menu Item"
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

      {/* ================= DESKTOP VIEW: CLEAN RESPONSIVE TABLE (hidden md:block) ================= */}
      <div className="hidden md:block bg-white dark:bg-[#1F1009] rounded-2xl border border-[#E8DFC8] dark:border-[#3A2012] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E8DFC8] dark:border-[#3A2012] bg-[#FAF6F0] dark:bg-[#120804] text-[11px] font-bold uppercase tracking-wider text-[#8D6E63] dark:text-[#A89080]">
                <th className="py-3.5 px-4">Menu Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price (ETB)</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EBE1] dark:divide-[#3A2012] text-xs text-[#3E2723] dark:text-[#FAF4ED]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[#8D6E63] dark:text-[#A89080]">
                    No items found matching your filter. Tap &quot;Add New Menu Item&quot; to create one.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const isAvail = product.is_available === 1;
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#FDFBF7] dark:hover:bg-[#2A170D] transition-colors"
                    >
                      {/* Item Thumbnail & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#FAF6F0] dark:bg-[#2A170D] shrink-0 border border-[#E8DFC8] dark:border-[#3A2012]">
                            {product.image_url ? (
                              <img
                                src={product.image_url}
                                alt={product.name}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                className={`w-full h-full object-cover ${!isAvail ? 'opacity-50 grayscale' : ''}`}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[#BCAAA4]">
                                <Coffee className="w-6 h-6" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-[#2C1810] dark:text-[#FAF4ED] block text-sm">
                              {product.name}
                            </span>
                            <span className="text-[11px] text-[#8D6E63] dark:text-[#A89080] line-clamp-1 max-w-sm">
                              {product.description || product.description_am || '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Section / Category */}
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium text-[#4E342E] dark:text-[#D69E76] bg-[#EFEBE9] dark:bg-[#2A170D] px-2.5 py-1 rounded-md border border-[#D7CCC8]/60 dark:border-[#3A2012]">
                          {product.category_name}
                        </span>
                      </td>

                      {/* Price in ETB */}
                      <td className="py-3 px-4 font-serif font-bold text-sm text-[#2C1810] dark:text-[#D4AF37]">
                        {product.price_etb} <span className="text-[10px] text-[#8D6E63] dark:text-[#A89080] font-sans font-semibold">ETB</span>
                      </td>

                      {/* Instant Toggle Availability */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleAvailability(product)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                            isAvail
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100'
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
                            className="p-2 rounded-lg bg-[#EFEBE9] dark:bg-[#2A170D] text-[#4E342E] dark:text-[#FAF4ED] hover:bg-[#D7CCC8] dark:hover:bg-[#3A2012] transition-colors"
                            title="Edit Menu Item"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(product)}
                            className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 transition-colors"
                            title="Delete Menu Item"
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
        title="Delete Menu Item"
        message={`Are you sure you want to delete "${productToDelete?.name}" from the menu? This will remove it from the customer website immediately.`}
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
