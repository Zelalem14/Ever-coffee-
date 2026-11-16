import React from 'react';
import { 
  Coffee, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Coins, 
  TrendingUp, 
  PieChart as PieIcon, 
  ShieldCheck,
  Plus,
  Activity
} from 'lucide-react';
import { useMenu } from '../../context/MenuContext';

export default function AdminStats({ onNavigate }) {
  const { stats, products, categories } = useMenu();

  const totalProducts = stats?.totalProducts ?? products.length;
  const totalCategories = stats?.totalCategories ?? categories.length;
  const availableProducts = stats?.availableProducts ?? products.filter(p => p.is_available === 1).length;
  const unavailableProducts = stats?.unavailableProducts ?? products.filter(p => p.is_available === 0).length;
  const featuredProducts = stats?.featuredProducts ?? products.filter(p => p.is_featured === 1).length;
  
  const avgPrice = stats?.averagePrice ?? (products.length ? Math.round(products.reduce((acc, p) => acc + (p.price_etb || 0), 0) / products.length) : 0);
  const stockRatio = totalProducts > 0 ? Math.round((availableProducts / totalProducts) * 100) : 100;

  // Breakdown calculations for visual charts
  const drinksCount = products.filter(p => {
    const s = (p.category_slug || '').toLowerCase();
    const n = (p.category_name || '').toLowerCase();
    return s.includes('drink') || s.includes('coffee') || s.includes('tea') || n.includes('drink');
  }).length;
  const foodsCount = Math.max(0, totalProducts - drinksCount);
  const drinksPct = totalProducts > 0 ? Math.round((drinksCount / totalProducts) * 100) : 50;
  const foodsPct = 100 - drinksPct;

  // Price tiers
  const tierBudget = products.filter(p => (p.price_etb || 0) < 40).length;
  const tierMid = products.filter(p => (p.price_etb || 0) >= 40 && (p.price_etb || 0) <= 60).length;
  const tierPremium = products.filter(p => (p.price_etb || 0) > 60).length;

  const cards = [
    {
      title: "Total Menu Items",
      value: totalProducts,
      sub: `${drinksCount} drinks · ${foodsCount} snacks`,
      icon: Coffee,
      color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      trend: "+100% active"
    },
    {
      title: "Active Categories",
      value: totalCategories,
      sub: "Drinks & Foods/Snacks",
      icon: Layers,
      color: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
      trend: "Organized"
    },
    {
      title: "In Stock Today",
      value: availableProducts,
      sub: `${stockRatio}% menu availability`,
      icon: CheckCircle2,
      color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
      trend: `${stockRatio}% ready`
    },
    {
      title: "Out of Stock",
      value: unavailableProducts,
      sub: unavailableProducts === 0 ? "All items available" : "Needs restock",
      icon: AlertCircle,
      color: unavailableProducts > 0 ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20" : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
      trend: unavailableProducts > 0 ? "Action needed" : "Clean"
    },
    {
      title: "Featured Items",
      value: featuredProducts,
      sub: "Signature specialties",
      icon: Sparkles,
      color: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
      trend: "Promoted"
    },
    {
      title: "Average Price",
      value: `${avgPrice} ETB`,
      sub: "Per item across menu",
      icon: Coins,
      color: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
      trend: "Balanced"
    }
  ];

  return (
    <div className="space-y-6">
      {/* 6 Key Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8D6E63] dark:text-[#D69E76] line-clamp-1">
                  {card.title}
                </span>
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border flex items-center justify-center shrink-0 ${card.color}`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              <div className="mt-2.5 sm:mt-3">
                <div className="font-serif text-xl sm:text-2xl font-bold text-[#2C1810] dark:text-[#FAF4ED]">
                  {card.value}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <p className="text-[10px] sm:text-[11px] text-[#8D6E63] dark:text-[#A89080] truncate">
                    {card.sub}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Analytics & Data Visualizations Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Chart 1: Menu Category Breakdown */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-[#8D6E63] dark:text-[#D69E76]" />
              <h4 className="font-serif text-sm font-bold text-[#2C1810] dark:text-[#FAF4ED]">
                Category Distribution
              </h4>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FAF6F0] dark:bg-[#1F1009] text-[#795548] dark:text-[#D69E76]">
              {totalProducts} Items
            </span>
          </div>

          {/* Stacked Visual Bar */}
          <div className="w-full h-3.5 rounded-full bg-[#EFEBE9] dark:bg-[#1F1009] overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${drinksPct}%` }} 
              className="h-full bg-[#4E342E] dark:bg-[#D4AF37] transition-all duration-500"
              title={`Drinks: ${drinksCount} (${drinksPct}%)`}
            />
            <div 
              style={{ width: `${foodsPct}%` }} 
              className="h-full bg-[#A1887F] dark:bg-[#8D6E63] transition-all duration-500"
              title={`Foods & Snacks: ${foodsCount} (${foodsPct}%)`}
            />
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF6F0] dark:bg-[#1F1009]/60 border border-[#E8DFC8]/60 dark:border-[#3A2012]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#4E342E] dark:bg-[#D4AF37]" />
              <div>
                <p className="font-bold text-[#2C1810] dark:text-[#FAF4ED]">{drinksCount} Drinks</p>
                <p className="text-[10px] text-[#8D6E63] dark:text-[#A89080]">{drinksPct}% of menu</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#FAF6F0] dark:bg-[#1F1009]/60 border border-[#E8DFC8]/60 dark:border-[#3A2012]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#A1887F] dark:bg-[#8D6E63]" />
              <div>
                <p className="font-bold text-[#2C1810] dark:text-[#FAF4ED]">{foodsCount} Snacks</p>
                <p className="text-[10px] text-[#8D6E63] dark:text-[#A89080]">{foodsPct}% of menu</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Inventory & Stock Health */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-serif text-sm font-bold text-[#2C1810] dark:text-[#FAF4ED]">
                Stock Availability Health
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
              {stockRatio}% Available
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[#5D4037] dark:text-[#D69E76]">
              <span>Available ({availableProducts})</span>
              <span>Unavailable ({unavailableProducts})</span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-rose-100 dark:bg-rose-950/40 overflow-hidden flex">
              <div 
                style={{ width: `${stockRatio}%` }} 
                className="h-full bg-emerald-600 dark:bg-emerald-500 transition-all duration-500" 
              />
            </div>
          </div>

          <p className="text-[11px] text-[#8D6E63] dark:text-[#A89080] leading-relaxed">
            {unavailableProducts === 0 
              ? "All products are currently in stock and visible to customer orders."
              : `${unavailableProducts} item(s) marked out of stock. Customers see "Out of Stock" badges.`}
          </p>
        </div>

        {/* Chart 3: Price Spread Meter */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="font-serif text-sm font-bold text-[#2C1810] dark:text-[#FAF4ED]">
                Price Spread (ETB)
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
              Avg {avgPrice} ETB
            </span>
          </div>

          {/* 3 Tier Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-[#795548] dark:text-[#D69E76]">
              <span>Under 40 ETB (Everyday)</span>
              <span className="font-bold">{tierBudget} items</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EFEBE9] dark:bg-[#1F1009] overflow-hidden">
              <div 
                style={{ width: `${totalProducts ? (tierBudget / totalProducts) * 100 : 0}%` }} 
                className="h-full bg-emerald-500 rounded-full" 
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#795548] dark:text-[#D69E76]">
              <span>40 – 60 ETB (Standard)</span>
              <span className="font-bold">{tierMid} items</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EFEBE9] dark:bg-[#1F1009] overflow-hidden">
              <div 
                style={{ width: `${totalProducts ? (tierMid / totalProducts) * 100 : 0}%` }} 
                className="h-full bg-amber-500 rounded-full" 
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#795548] dark:text-[#D69E76]">
              <span>60+ ETB (Specialty)</span>
              <span className="font-bold">{tierPremium} items</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EFEBE9] dark:bg-[#1F1009] overflow-hidden">
              <div 
                style={{ width: `${totalProducts ? (tierPremium / totalProducts) * 100 : 0}%` }} 
                className="h-full bg-purple-500 rounded-full" 
              />
            </div>
          </div>
        </div>

      </div>

      {/* Quick Action Shortcuts */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FAF6F0] via-white to-[#FAF6F0] dark:from-[#2A170D] dark:via-[#1F1009] dark:to-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-serif text-sm font-bold text-[#2C1810] dark:text-[#FAF4ED]">
            Quick Management Actions
          </h4>
          <p className="text-xs text-[#8D6E63] dark:text-[#A89080]">
            Common administrator shortcuts for Ever Coffee House
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigate?.('items')}
            className="flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Menu Items</span>
          </button>

          <button
            onClick={() => onNavigate?.('logs')}
            className="flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1F1009] text-[#5D4037] dark:text-[#FAF4ED] border border-[#D7CCC8] dark:border-[#3A2012] hover:bg-[#EFEBE9] dark:hover:bg-[#2A170D] active:scale-95 transition-all"
          >
            <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>View Activity Logs</span>
          </button>

          <button
            onClick={() => onNavigate?.('users')}
            className="flex items-center gap-1.5 min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-[#1F1009] text-[#5D4037] dark:text-[#FAF4ED] border border-[#D7CCC8] dark:border-[#3A2012] hover:bg-[#EFEBE9] dark:hover:bg-[#2A170D] active:scale-95 transition-all"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Security & Users</span>
          </button>
        </div>
      </div>
    </div>
  );
}
