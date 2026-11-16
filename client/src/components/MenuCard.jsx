import React from 'react';
import { Coffee, ChevronRight } from 'lucide-react';
import { useMenu } from '../context/MenuContext';

export default function MenuCard({ item, mode = 'grid' }) {
  const { setSelectedProduct } = useMenu();
  const isAvailable = item.is_available === 1;

  // List View (Horizontal Card layout for rapid thumb scrolling on mobile)
  if (mode === 'list') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => setSelectedProduct(item)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedProduct(item); }}
        className="group relative bg-white rounded-2xl p-3 border border-[#E8DFC8] shadow-2xs hover:shadow-md hover:border-[#BCAAA4] active:scale-[0.99] active:bg-[#FAF6F0] transition-all flex items-center gap-3.5 cursor-pointer min-h-[72px]"
      >
        {/* Left Thumbnail (68x68) */}
        <div className="relative w-16 h-16 xs:w-18 xs:h-18 rounded-xl overflow-hidden bg-[#FAF6F0] shrink-0 border border-[#E8DFC8]/60">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={item.name}
              loading="lazy"
              className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300 ${
                !isAvailable ? 'opacity-50 grayscale' : ''
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#BCAAA4]">
              <Coffee className="w-8 h-8" />
            </div>
          )}

          {!isAvailable && (
            <span className="absolute inset-0 bg-black/40 flex items-center justify-center text-[9px] font-bold text-white uppercase tracking-wider">
              Out
            </span>
          )}
        </div>

        {/* Center Details */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-sm xs:text-base font-bold text-[#2C1810] group-hover:text-[#6D4C41] truncate">
              {item.name}
            </h3>
            {isAvailable ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="In Stock" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" title="Out of Stock" />
            )}
          </div>

          {item.description && (
            <p className="text-[11px] xs:text-xs text-[#795548] leading-tight line-clamp-1 mt-0.5 font-light">
              {item.description}
            </p>
          )}
          {item.description_am && (
            <p className="text-[11px] xs:text-xs text-[#5D4037] leading-tight line-clamp-1 mt-0.5 font-normal">
              {item.description_am}
            </p>
          )}

          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="font-serif text-base xs:text-lg font-black text-[#3E2723]">
              {item.price_etb}
            </span>
            <span className="text-[10px] font-bold text-[#8D6E63]">
              ETB
            </span>
          </div>
        </div>

        {/* Right Arrow indicator */}
        <div className="shrink-0 p-1 rounded-full text-[#BCAAA4] group-hover:text-[#3E2723] group-hover:translate-x-0.5 transition-all">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    );
  }

  // Grid View (Card layout with rich photo)
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setSelectedProduct(item)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedProduct(item); }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-[#E8DFC8] shadow-xs hover:shadow-md hover:border-[#BCAAA4] active:scale-[0.98] transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Picture */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF6F0]">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.name}
            loading="lazy"
            className={`w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300 ${
              !isAvailable ? 'opacity-60 grayscale' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#BCAAA4]">
            <Coffee className="w-10 h-10" />
          </div>
        )}

        {/* Availability Badge */}
        <div className="absolute top-2 right-2 z-10">
          {isAvailable ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50/95 text-emerald-800 border border-emerald-200 shadow-2xs backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Available</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50/95 text-rose-800 border border-rose-200 shadow-2xs backdrop-blur-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span>Out of stock</span>
            </span>
          )}
        </div>
      </div>

      {/* Content Details */}
      <div className="p-3 xs:p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <h3 className="font-serif text-sm xs:text-base font-bold text-[#2C1810] group-hover:text-[#6D4C41] transition-colors line-clamp-1">
            {item.name}
          </h3>

          {item.description && (
            <p className="text-[11px] xs:text-xs text-[#795548] leading-relaxed line-clamp-2 mt-0.5 font-light">
              {item.description}
            </p>
          )}
          {item.description_am && (
            <p className="text-[11px] xs:text-xs text-[#8D6E63] leading-relaxed line-clamp-2 mt-0.5 font-normal">
              {item.description_am}
            </p>
          )}
        </div>

        {/* Price Row in ETB */}
        <div className="pt-2 border-t border-[#F5EBE1] flex items-center justify-between">
          <span className="text-[10px] text-[#A1887F] uppercase tracking-wider font-semibold">
            Price
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-base xs:text-lg sm:text-xl font-extrabold text-[#3E2723]">
              {item.price_etb}
            </span>
            <span className="text-[10px] xs:text-xs font-bold text-[#8D6E63]">
              ETB
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
