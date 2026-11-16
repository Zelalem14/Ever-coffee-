import React from 'react';
import { Sparkles, Flame, Star, Eye } from 'lucide-react';
import { useMenu } from '../context/MenuContext';

export default function ProductCard({ product }) {
  const { setSelectedProduct } = useMenu();

  const isAvailable = product.is_available === 1;

  // Split dietary tags if present
  const tags = product.dietary_tags
    ? product.dietary_tags.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group relative bg-white rounded-3xl overflow-hidden border border-zinc-200/80 shadow-xs hover:shadow-xl hover:shadow-zinc-200/70 hover:border-amber-400/80 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-zinc-100">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-500 ${
            !isAvailable ? 'grayscale-[60%] opacity-85' : ''
          }`}
        />

        {/* Subtle Gradient Shadow Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Top Badges: Featured, Popular, New */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          {product.is_featured === 1 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500 text-white backdrop-blur-sm shadow-xs">
              <Sparkles className="w-3 h-3 fill-white" />
              Featured
            </span>
          )}
          {product.is_popular === 1 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-600 text-white backdrop-blur-sm shadow-xs">
              <Flame className="w-3 h-3 fill-white" />
              Popular
            </span>
          )}
          {product.is_new === 1 && (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600 text-white backdrop-blur-sm shadow-xs">
              <Star className="w-3 h-3 fill-white" />
              New
            </span>
          )}
        </div>

        {/* Availability Badge (Top Right) */}
        <div className="absolute top-3 right-3 z-10">
          {isAvailable ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/95 text-emerald-800 border border-emerald-200 backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Available
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/95 text-rose-800 border border-rose-200 backdrop-blur-md shadow-xs">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Unavailable
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-zinc-950/30 backdrop-blur-[2px]">
          <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-zinc-900 text-xs font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            <Eye className="w-4 h-4 text-zinc-700" />
            Quick View Details
          </span>
        </div>

        {/* Category Label at Bottom Left of Image */}
        <div className="absolute bottom-2.5 left-3 z-10">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white bg-black/60 px-2.5 py-0.5 rounded-md backdrop-blur-sm">
            {product.category_name}
          </span>
        </div>
      </div>

      {/* Product Content Details */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
        <div className="space-y-1.5">
          <h3 className="font-serif text-lg font-bold text-zinc-950 group-hover:text-amber-700 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed line-clamp-2 font-normal">
            {product.description || 'Crafted with premium ingredients in our Ethiopian coffee house.'}
          </p>
        </div>

        {/* Dietary / Origin Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200/60"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-[10px] text-zinc-400 self-center">
                +{tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block">
              Price
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-xl sm:text-2xl font-extrabold text-zinc-950">
                {product.price_etb}
              </span>
              <span className="text-xs font-bold font-sans text-amber-700">
                ETB
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedProduct(product);
            }}
            className="p-2.5 rounded-xl bg-zinc-100 hover:bg-amber-600 hover:text-white text-zinc-700 transition-colors"
            title="View Details"
            aria-label={`View details for ${product.name}`}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
