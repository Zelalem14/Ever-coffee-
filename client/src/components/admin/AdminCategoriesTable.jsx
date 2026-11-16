import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Coffee, CupSoda, GlassWater, Cookie, Popcorn, Cake, Utensils, Sparkles } from 'lucide-react';
import { api } from '../../api/api';
import { useMenu } from '../../context/MenuContext';
import { useToast } from '../../context/ToastContext';
import CategoryModal from './CategoryModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

const iconMap = {
  Coffee,
  CupSoda,
  GlassWater,
  Cookie,
  Popcorn,
  Cake,
  Utensils,
  Sparkles
};

export default function AdminCategoriesTable() {
  const { categories, refreshData } = useMenu();
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleOpenAdd = () => {
    setCategoryToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setCategoryToEdit(cat);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setDeleting(true);
      await api.deleteCategory(categoryToDelete.id);
      addToast(`Deleted category "${categoryToDelete.name}".`, 'success');
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to delete category', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const renderIcon = (name) => {
    const IconComponent = iconMap[name] || Coffee;
    return <IconComponent className="w-5 h-5 text-[#5D4037]" />;
  };

  return (
    <div className="space-y-4">
      
      {/* Top Header & Add Button */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E8DFC8] shadow-xs">
        <div>
          <h4 className="font-serif text-lg font-bold text-[#2C1810]">
            Menu Categories ({categories.length})
          </h4>
          <p className="text-xs text-[#8D6E63]">
            Create, edit, or organize menu categories for Ever Coffee House.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#3E2723] hover:bg-[#2C1810] active:scale-95 shadow-xs transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Responsive Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DFC8] shadow-2xs hover:border-[#BCAAA4] hover:shadow-md transition-all flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#FAF6F0] border border-[#E8DFC8] flex items-center justify-center">
                  {renderIcon(cat.icon)}
                </div>
                <span className="text-[11px] font-mono text-[#6D4C41] bg-[#FAF6F0] px-2.5 py-1 rounded-lg border border-[#E8DFC8]">
                  Order #{cat.display_order}
                </span>
              </div>

              <div>
                <h5 className="font-serif text-lg font-bold text-[#2C1810]">
                  {cat.name}
                </h5>
                <span className="text-xs font-mono text-[#8D6E63]">
                  /{cat.slug}
                </span>
              </div>

              <p className="text-xs text-[#6D4C41] line-clamp-2 leading-relaxed">
                {cat.description || 'No description provided.'}
              </p>
            </div>

            <div className="pt-3 border-t border-[#F5EBE1] flex items-center justify-between text-xs">
              <span className="font-medium text-[#8D6E63]">
                <strong className="text-[#2C1810] font-bold">{cat.product_count || 0}</strong> items
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-[#EFEBE9] hover:bg-[#D7CCC8] text-[#4E342E] active:scale-95 transition-colors"
                  title="Edit Category"
                  aria-label={`Edit ${cat.name}`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenDelete(cat)}
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 active:scale-95 transition-colors"
                  title="Delete Category"
                  aria-label={`Delete ${cat.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        categoryToEdit={categoryToEdit}
        onSaved={refreshData}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? All items inside this category will also be removed.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCategoryToDelete(null);
        }}
        loading={deleting}
      />

    </div>
  );
}
