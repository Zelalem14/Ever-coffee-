import React from 'react';
import { Search, X, Sparkles, Star, Flame, Tag, CheckCircle2, ArrowUpDown } from 'lucide-react';
import { useMenu } from '../context/MenuContext';

export default function FilterBar() {
  const {
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    sortBy,
    setSortBy,
    filteredProducts,
    activeCategory,
    categories
  } = useMenu();

  const currentCategoryName = activeCategory === 'all'
    ? 'All Categories'
    : categories.find(c => c.slug === activeCategory || c.id === activeCategory)?.name || 'Category';

  const filterPills = [
    { id: 'all', label: 'All', icon: null },
    { id: 'popular', label: 'Popular', icon: Flame },
    { id: 'featured', label: 'Featured', icon: Sparkles },
    { id: 'new', label: 'New Arrivals', icon: Star },
    { id: 'under-100', label: 'Under 100 ETB', icon: Tag },
    { id: 'available', label: 'In Stock Only', icon: CheckCircle2 },
  ];

  return (
    <div className="space-y-4 pt-4">
      {/* Row 1: Search Box & Sort Selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Live Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${currentCategoryName.toLowerCase()} (e.g. Macchiato, Shai, Spris, Cake)...`}
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 rounded-full"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Selector Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <ArrowUpDown className="w-4 h-4 text-zinc-500" />
          <span className="text-xs font-medium text-zinc-600 hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-2.5 px-3 rounded-2xl bg-white border border-zinc-200 text-xs sm:text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-600 shadow-xs cursor-pointer"
          >
            <option value="default">Featured / Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Product Name (A-Z)</option>
          </select>
        </div>

      </div>

      {/* Row 2: Filter Pills & Result Count */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        
        {/* Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {filterPills.map((pill) => {
            const Icon = pill.icon;
            const isSelected = selectedFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setSelectedFilter(pill.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isSelected
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 shadow-xs'
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-zinc-500'}`} />}
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* Count Indicator */}
        <div className="text-xs font-medium text-zinc-500">
          Showing <span className="font-bold text-zinc-900">{filteredProducts.length}</span> items
        </div>

      </div>
    </div>
  );
}
