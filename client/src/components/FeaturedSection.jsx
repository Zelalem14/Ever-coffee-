import React from 'react';
import { ArrowRight, Award } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import ProductCard from './ProductCard';

export default function FeaturedSection() {
  const { featuredProducts, setSelectedFilter } = useMenu();

  const handleExploreAllFeatured = () => {
    setSelectedFilter('featured');
    const menuEl = document.querySelector('#menu');
    if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
  };

  const displayItems = featuredProducts.slice(0, 6);
  if (displayItems.length === 0) return null;

  return (
    <section id="featured" className="py-20 bg-zinc-50/70 border-t border-zinc-200/70 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>House Highlights</span>
            </div>
            
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
              Featured Specialties & Roasts
            </h2>
            
            <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
              Curated master selections that embody the heart of Ethiopian coffee craftsmanship, traditional ceremonies, and decadent pairing treats.
            </p>
          </div>

          <button
            onClick={handleExploreAllFeatured}
            className="group inline-flex items-center gap-2 text-sm font-bold text-amber-700 hover:text-amber-800 transition-colors self-start md:self-auto"
          >
            <span>View All Featured Items</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Featured Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {displayItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}
