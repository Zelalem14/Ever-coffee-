import React, { useRef } from 'react';
import { 
  Coffee, 
  CupSoda, 
  GlassWater, 
  Cookie, 
  Popcorn, 
  Cake, 
  Utensils, 
  Layers, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useMenu } from '../context/MenuContext';

// Map icon string names to Lucide components
const iconMap = {
  Coffee: Coffee,
  CupSoda: CupSoda,
  GlassWater: GlassWater,
  Cookie: Cookie,
  Popcorn: Popcorn,
  Cake: Cake,
  Sparkles: Sparkles,
  Utensils: Utensils
};

export default function CategoryBar() {
  const { categories, products, activeCategory, setActiveCategory } = useMenu();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getCategoryIcon = (iconName) => {
    const IconComponent = iconMap[iconName] || Coffee;
    return <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />;
  };

  return (
    <div className="relative w-full">
      {/* Category Navigation Wrapper with Left/Right Scroll Buttons */}
      <div className="relative flex items-center">
        
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex absolute -left-3 z-10 w-9 h-9 items-center justify-center rounded-full bg-white text-zinc-700 border border-zinc-200 shadow-md hover:bg-zinc-50 transition-colors"
          aria-label="Scroll categories left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Categories Horizontal Scrollable Strip */}
        <div
          ref={scrollRef}
          className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar py-2 px-1 w-full scroll-smooth"
        >
          {/* "All" Category Pill */}
          <button
            onClick={() => setActiveCategory('all')}
            className={`group shrink-0 flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-xs ${
              activeCategory === 'all'
                ? 'bg-zinc-950 text-white border border-zinc-950 shadow-md'
                : 'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200/90 hover:border-zinc-300'
            }`}
          >
            <Layers className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${activeCategory === 'all' ? 'text-amber-400 scale-110' : 'text-zinc-500 group-hover:scale-105'}`} />
            <span>All Items</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                activeCategory === 'all'
                  ? 'bg-white/20 text-white'
                  : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              {products.length}
            </span>
          </button>

          {/* Individual Category Tabs */}
          {categories.map((cat) => {
            const isActive = activeCategory === cat.slug || activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.slug)}
                className={`group shrink-0 flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-300 shadow-xs ${
                  isActive
                    ? 'bg-zinc-950 text-white border border-zinc-950 shadow-md'
                    : 'bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200/90 hover:border-zinc-300'
                }`}
              >
                <span className={`transition-transform duration-300 ${isActive ? 'text-amber-400 scale-110' : 'text-zinc-500 group-hover:scale-105'}`}>
                  {getCategoryIcon(cat.icon)}
                </span>
                <span className="whitespace-nowrap">{cat.name}</span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-zinc-100 text-zinc-700'
                  }`}
                >
                  {cat.product_count !== undefined ? cat.product_count : 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex absolute -right-3 z-10 w-9 h-9 items-center justify-center rounded-full bg-white text-zinc-700 border border-zinc-200 shadow-md hover:bg-zinc-50 transition-colors"
          aria-label="Scroll categories right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
}
