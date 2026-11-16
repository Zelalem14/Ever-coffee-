import React from 'react';
import { Coffee, Layers, CheckCircle2, AlertCircle, Sparkles, DollarSign } from 'lucide-react';
import { useMenu } from '../../context/MenuContext';

export default function AdminStats() {
  const { stats, products, categories } = useMenu();

  const totalProducts = stats?.totalProducts ?? products.length;
  const totalCategories = stats?.totalCategories ?? categories.length;
  const availableProducts = stats?.availableProducts ?? products.filter(p => p.is_available === 1).length;
  const unavailableProducts = stats?.unavailableProducts ?? products.filter(p => p.is_available === 0).length;
  const featuredProducts = stats?.featuredProducts ?? products.filter(p => p.is_featured === 1).length;
  const avgPrice = stats?.averagePrice ?? (products.length ? Math.round(products.reduce((acc, p) => acc + p.price_etb, 0) / products.length) : 0);

  const cards = [
    {
      title: "Total Products",
      value: totalProducts,
      sub: "Menu items in database",
      icon: Coffee,
      iconColor: "text-amber-700 bg-amber-50 border-amber-200"
    },
    {
      title: "Active Categories",
      value: totalCategories,
      sub: "Organized sections",
      icon: Layers,
      iconColor: "text-blue-700 bg-blue-50 border-blue-200"
    },
    {
      title: "Available Today",
      value: availableProducts,
      sub: "Currently in stock",
      icon: CheckCircle2,
      iconColor: "text-emerald-700 bg-emerald-50 border-emerald-200"
    },
    {
      title: "Out of Stock",
      value: unavailableProducts,
      sub: "Marked unavailable",
      icon: AlertCircle,
      iconColor: "text-rose-700 bg-rose-50 border-rose-200"
    },
    {
      title: "Featured Specialties",
      value: featuredProducts,
      sub: "Highlighted on menu",
      icon: Sparkles,
      iconColor: "text-amber-700 bg-amber-50 border-amber-200"
    },
    {
      title: "Average Price",
      value: `${avgPrice} ETB`,
      sub: "Across all menu items",
      icon: DollarSign,
      iconColor: "text-purple-700 bg-purple-50 border-purple-200"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                {card.title}
              </span>
              <div className={`w-8 h-8 rounded-xl border flex items-center justify-center ${card.iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-3">
              <div className="font-serif text-2xl font-bold text-zinc-950">
                {card.value}
              </div>
              <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                {card.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
