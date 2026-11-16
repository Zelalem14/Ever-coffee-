import React, { useState } from 'react';
import { Coffee, Cookie, CupSoda, GlassWater, Popcorn, Cake, Utensils, Sparkles, Search, X, Layers, LayoutGrid, ListFilter } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import MenuCard from './MenuCard';

const iconMap = {
  Coffee,
  Cookie,
  CupSoda,
  GlassWater,
  Popcorn,
  Cake,
  Utensils,
  Sparkles
};

export default function SimpleMenu() {
  const { 
    categories,
    products, 
    loading, 
    activeTab, 
    setActiveTab, 
    viewMode, 
    setViewMode 
  } = useMenu();

  const [search, setSearch] = useState('');

  // Filter items by search query (English & Amharic)
  const matchesSearch = (item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    const matchName = item.name.toLowerCase().includes(q);
    const matchDesc = (item.description || '').toLowerCase().includes(q);
    const matchDescAm = (item.description_am || '').toLowerCase().includes(q);
    return matchName || matchDesc || matchDescAm;
  };

  // Match category against activeTab ('all', 'drinks', 'foods', or specific slug)
  const categoryMatchesTab = (cat) => {
    if (activeTab === 'all') return true;
    if (activeTab === cat.slug) return true;
    const slugLower = (cat.slug || '').toLowerCase();
    const nameLower = (cat.name || '').toLowerCase();
    if (activeTab === 'drinks') {
      return slugLower.includes('drink') || nameLower.includes('drink');
    }
    if (activeTab === 'foods') {
      return slugLower.includes('food') || slugLower.includes('snack') || nameLower.includes('snack') || nameLower.includes('food');
    }
    return false;
  };

  // Build visible sections dynamically from database categories
  const visibleSections = categories
    .filter(categoryMatchesTab)
    .map((cat) => {
      const items = products.filter((p) => p.category_id === cat.id && matchesSearch(p));
      return { category: cat, items };
    })
    .filter((section) => section.items.length > 0);

  const totalFiltered = visibleSections.reduce((sum, s) => sum + s.items.length, 0);

  const renderCategoryIcon = (iconName, isActive = false) => {
    const Icon = iconMap[iconName] || Coffee;
    return <Icon className={`w-4 h-4 ${isActive ? 'text-[#FFE082]' : 'text-[#8D6E63]'}`} />;
  };

  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-6 pb-28 md:pb-12">
      
      {/* Sticky Mobile-First Navigation Strip */}
      <div className="sticky top-0 z-30 bg-[#FDFBF7]/95 dark:bg-[#120804]/95 backdrop-blur-md py-2.5 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 border-b border-[#E8DFC8]/70 dark:border-[#3A2012] space-y-2.5 transition-colors">
        
        {/* Search input + View Switcher Row */}
        <div className="flex items-center gap-2">
          
          {/* Touch-Friendly Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coffee, tea, juice, chips..."
              className="w-full min-h-[44px] pl-10 pr-9 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] text-sm text-[#3E2723] dark:text-[#FAF4ED] placeholder:text-[#A1887F] bg-white dark:bg-[#1F1009] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 focus:border-[#8D6E63] shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] flex items-center justify-center text-[#A1887F] hover:text-[#3E2723] dark:hover:text-[#FAF4ED] active:scale-95"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Grid vs List View Mode Toggle */}
          <div className="flex items-center bg-[#EFEBE9] dark:bg-[#2A170D] p-1 rounded-xl shrink-0 border border-[#D7CCC8]/60 dark:border-[#3A2012]">
            <button
              onClick={() => setViewMode('grid')}
              className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-white dark:bg-[#1F1009] text-[#3E2723] dark:text-[#D4AF37] shadow-2xs font-semibold' 
                  : 'text-[#8D6E63] dark:text-[#A89080] hover:text-[#3E2723]'
              }`}
              title="Grid View"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-white dark:bg-[#1F1009] text-[#3E2723] dark:text-[#D4AF37] shadow-2xs font-semibold' 
                  : 'text-[#8D6E63] dark:text-[#A89080] hover:text-[#3E2723]'
              }`}
              title="List View"
              aria-label="List view"
            >
              <ListFilter className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Dynamic Horizontal Category Carousel */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          
          <button
            onClick={() => setActiveTab('all')}
            className={`flex items-center gap-1.5 min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all active:scale-95 ${
              activeTab === 'all'
                ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-xs'
                : 'bg-white dark:bg-[#1F1009] text-[#5D4037] dark:text-[#D69E76] border border-[#E8DFC8] dark:border-[#3A2012] hover:bg-[#FAF6F0] dark:hover:bg-[#2A170D]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Menu</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
              activeTab === 'all' ? 'bg-white/20 text-white dark:text-[#120804]' : 'bg-[#EFEBE9] dark:bg-[#2A170D] text-[#4E342E] dark:text-[#FAF4ED]'
            }`}>
              {products.length}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = categoryMatchesTab(cat) && activeTab !== 'all';
            const catCount = products.filter((p) => p.category_id === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.slug)}
                className={`flex items-center gap-1.5 min-h-[42px] px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-xs'
                    : 'bg-white dark:bg-[#1F1009] text-[#5D4037] dark:text-[#D69E76] border border-[#E8DFC8] dark:border-[#3A2012] hover:bg-[#FAF6F0] dark:hover:bg-[#2A170D]'
                }`}
              >
                {renderCategoryIcon(cat.icon, isSelected)}
                <span>{cat.name}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white dark:text-[#120804]' : 'bg-[#EFEBE9] dark:bg-[#2A170D] text-[#4E342E] dark:text-[#FAF4ED]'
                }`}>
                  {catCount}
                </span>
              </button>
            );
          })}

        </div>

      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className={viewMode === 'list' ? 'space-y-3' : 'grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-3 border border-[#E8DFC8] space-y-3 animate-pulse">
              <div className="aspect-[4/3] w-full bg-[#EFEBE9] rounded-xl" />
              <div className="h-4 bg-[#EFEBE9] rounded w-3/4" />
              <div className="h-3 bg-[#EFEBE9] rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : totalFiltered === 0 ? (
        /* Empty Search Result */
        <div className="text-center py-12 bg-white rounded-3xl border border-[#E8DFC8] p-6 max-w-sm mx-auto space-y-3">
          <p className="font-serif text-lg font-bold text-[#3E2723]">
            No matching items
          </p>
          <p className="text-xs text-[#795548]">
            {search
              ? `We couldn't find any menu items matching "${search}".`
              : 'There are currently no items available in this category.'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#4E342E] hover:bg-[#3E2723] active:scale-95 transition-all"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-10">
          {visibleSections.map(({ category, items }) => {
            const Icon = iconMap[category.icon] || Coffee;
            return (
              <section key={category.id} id={category.slug} className="space-y-3.5 scroll-mt-24">
                
                <div className="flex items-center gap-2.5 pb-2 border-b-2 border-[#D7CCC8]/60 dark:border-[#3A2012]">
                  <div className="w-8 h-8 rounded-xl bg-[#5D4037] dark:bg-[#D4AF37] text-[#FFE082] dark:text-[#120804] flex items-center justify-center shadow-xs shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#2C1810] dark:text-[#FAF4ED] tracking-tight uppercase">
                      {category.name}
                    </h2>
                    {(category.description || category.description_am) && (
                      <div className="space-y-0.5">
                        {category.description && (
                          <p className="text-[11px] sm:text-xs text-[#8D6E63] dark:text-[#D69E76] font-medium truncate">
                            {category.description} ({items.length})
                          </p>
                        )}
                        {category.description_am && (
                          <p className="text-[11px] sm:text-xs text-[#6D4C41] dark:text-[#A89080] font-normal truncate">
                            {category.description_am}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className={
                  viewMode === 'list' 
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3' 
                    : 'grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4'
                }>
                  {items.map((item) => (
                    <MenuCard key={item.id} item={item} mode={viewMode} />
                  ))}
                </div>

              </section>
            );
          })}
        </div>
      )}

    </div>
  );
}
