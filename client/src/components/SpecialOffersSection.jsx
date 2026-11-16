import React from 'react';
import { Tag, Clock } from 'lucide-react';
import { useMenu } from '../context/MenuContext';

export default function SpecialOffersSection() {
  const { setActiveCategory } = useMenu();

  const offers = [
    {
      title: "Morning Buna & Fresh Popcorn Ritual",
      badge: "Morning Ritual (6:30 AM - 11:00 AM)",
      description: "Traditional Jebena-brewed Yirgacheffe single-origin coffee served with fresh smoking frankincense and hot buttered popcorn.",
      regularPrice: "95 ETB",
      specialPrice: "75 ETB",
      savings: "Save 20 ETB",
      categorySlug: "coffee",
      image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Addis Macchiato & Warm Croissant Combo",
      badge: "All-Day Favorite",
      description: "Our signature layered Ethiopian double macchiato paired with a freshly baked 27-layer butter croissant.",
      regularPrice: "155 ETB",
      specialPrice: "135 ETB",
      savings: "Save 20 ETB",
      categorySlug: "sweets-bakery",
      image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Afternoon Spris & Assorted Cookies Duo",
      badge: "Afternoon Chill (2:00 PM - 6:00 PM)",
      description: "Chilled fresh layered avocado, mango & papaya Spris juice served with a platter of oven-baked assorted cookies.",
      regularPrice: "185 ETB",
      specialPrice: "160 ETB",
      savings: "Save 25 ETB",
      categorySlug: "cold-drinks",
      image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80"
    }
  ];

  const handleBrowseCategory = (slug) => {
    setActiveCategory(slug);
    const menuEl = document.querySelector('#menu');
    if (menuEl) menuEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="offers" className="py-20 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 border-t border-zinc-200/80 text-zinc-900 relative overflow-hidden">
      
      {/* Subtle light aura */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Tag className="w-3.5 h-3.5 text-amber-600" />
            <span>Daily Highlights & Combos</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-950 tracking-tight">
            Special Coffee House Pairings
          </h2>
          
          <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
            Discover our barista-curated daily pairings designed to celebrate Ethiopian flavors at great value. Browse items in our digital menu.
          </p>
        </div>

        {/* Offers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-3xl overflow-hidden border border-zinc-200/90 shadow-sm hover:shadow-xl hover:shadow-zinc-200/70 hover:border-amber-400 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Offer Card Image */}
                <div className="relative h-48 w-full overflow-hidden bg-zinc-100">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Savings Tag */}
                  <div className="absolute top-3 right-3 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    {offer.savings}
                  </div>
                </div>

                {/* Offer Details */}
                <div className="p-6 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {offer.badge}
                  </span>

                  <h3 className="font-serif text-xl font-bold text-zinc-950 group-hover:text-amber-700 transition-colors">
                    {offer.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                    {offer.description}
                  </p>
                </div>
              </div>

              {/* Price Row & CTA */}
              <div className="p-6 pt-0 border-t border-zinc-100 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-zinc-400 line-through block">
                    {offer.regularPrice}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-serif text-2xl font-black text-amber-800">
                      {offer.specialPrice}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleBrowseCategory(offer.categorySlug)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors shadow-xs"
                >
                  View Items
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
