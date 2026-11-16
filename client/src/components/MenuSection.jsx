import React from 'react';
import { Coffee, SearchX, RotateCcw } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import CategoryBar from './CategoryBar';
import FilterBar from './FilterBar';
import ProductCard from './ProductCard';

export default function MenuSection() {
  const {
    filteredProducts,
    loading,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    setActiveCategory
  } = useMenu();

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedFilter('all');
    setActiveCategory('all');
  };

  return (
    <section id="menu" className="py-20 bg-white relative scroll-mt-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Coffee className="w-3.5 h-3.5 text-amber-600" />
            <span>Digital Menu • Ethiopian Birr (ETB)</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-950 tracking-tight">
            Browse Drinks & Bites
          </h2>

          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
            Select a category, search your favorite items, or filter by popular and featured drinks. All prices are up-to-date and transparent.
          </p>
        </div>

        {/* Category Navigation Pills/Bar */}
        <CategoryBar />

        {/* Search, Filter Pills & Sort Controls */}
        <FilterBar />

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl p-4 border border-zinc-200 shadow-xs animate-pulse space-y-4"
              >
                <div className="aspect-[4/3] w-full bg-zinc-100 rounded-2xl" />
                <div className="h-4 bg-zinc-100 rounded w-3/4" />
                <div className="h-3 bg-zinc-100 rounded w-full" />
                <div className="h-6 bg-zinc-100 rounded w-1/3 pt-2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-zinc-50 rounded-3xl border border-zinc-200/80 shadow-xs max-w-md mx-auto p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white text-zinc-500 mx-auto flex items-center justify-center border border-zinc-200">
              <SearchX className="w-8 h-8 text-zinc-400" />
            </div>

            <h3 className="font-serif text-xl font-bold text-zinc-950">
              No matching items found
            </h3>

            <p className="text-xs text-zinc-600 leading-relaxed">
              We couldn't find any drinks or snacks matching your current search or category filter. Try clearing your search or switching categories.
            </p>

            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
