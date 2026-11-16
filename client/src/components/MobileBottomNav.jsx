import React from 'react';
import { Layers, Coffee, Cookie, QrCode, Sun, Moon } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useTheme } from '../context/ThemeContext';

export default function MobileBottomNav() {
  const { activeTab, setActiveTab, setIsMobileQrOpen } = useMenu();
  const { isDark, toggleTheme } = useTheme();

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    // Smooth scroll to top of menu
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const isDrinksActive = activeTab === 'drinks' || String(activeTab).toLowerCase().includes('drink');
  const isFoodsActive = activeTab === 'foods' || activeTab === 'foods-snacks' || String(activeTab).toLowerCase().includes('snack') || String(activeTab).toLowerCase().includes('food');

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1F1009]/95 backdrop-blur-md border-t border-zinc-200 dark:border-[#3A2012] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-safe transition-colors duration-200"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1 items-stretch">
        
        {/* Tab 1: All Menu */}
        <button
          onClick={() => handleTabClick('all')}
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition-all active:scale-95 ${
            activeTab === 'all'
              ? 'text-[#3E2723] dark:text-[#D4AF37] font-bold'
              : 'text-zinc-500 dark:text-[#A89080] hover:text-zinc-800 dark:hover:text-[#FAF4ED]'
          }`}
          aria-label="All Menu"
        >
          <div className={`p-1 rounded-xl transition-colors ${
            activeTab === 'all' ? 'bg-zinc-100 dark:bg-[#2A170D]' : ''
          }`}>
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">All</span>
        </button>

        {/* Tab 2: Drinks */}
        <button
          onClick={() => handleTabClick('drinks')}
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition-all active:scale-95 ${
            isDrinksActive
              ? 'text-[#3E2723] dark:text-[#D4AF37] font-bold'
              : 'text-zinc-500 dark:text-[#A89080] hover:text-zinc-800 dark:hover:text-[#FAF4ED]'
          }`}
          aria-label="Drinks"
        >
          <div className={`p-1 rounded-xl transition-colors ${
            isDrinksActive ? 'bg-zinc-100 dark:bg-[#2A170D]' : ''
          }`}>
            <Coffee className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Drinks</span>
        </button>

        {/* Tab 3: Snacks */}
        <button
          onClick={() => handleTabClick('foods')}
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition-all active:scale-95 ${
            isFoodsActive
              ? 'text-[#3E2723] dark:text-[#D4AF37] font-bold'
              : 'text-zinc-500 dark:text-[#A89080] hover:text-zinc-800 dark:hover:text-[#FAF4ED]'
          }`}
          aria-label="Snacks and Foods"
        >
          <div className={`p-1 rounded-xl transition-colors ${
            isFoodsActive ? 'bg-zinc-100 dark:bg-[#2A170D]' : ''
          }`}>
            <Cookie className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">Snacks</span>
        </button>

        {/* Tab 4: Theme Toggle (Instant Smooth Switch) */}
        <button
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 text-zinc-600 dark:text-[#D69E76] hover:text-zinc-900 dark:hover:text-[#FAF4ED] active:scale-95 transition-all"
          title={isDark ? "Switch to Bright Mode" : "Switch to Dark Mode"}
          aria-label={isDark ? "Switch to Bright Mode" : "Switch to Dark Mode"}
        >
          <div className="p-1 rounded-xl">
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-600" />
            )}
          </div>
          <span className="text-[10px] tracking-tight font-medium">
            {isDark ? 'Bright' : 'Dark'}
          </span>
        </button>

        {/* Tab 5: QR Code */}
        <button
          onClick={() => setIsMobileQrOpen(true)}
          className="flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 text-zinc-500 dark:text-[#A89080] hover:text-zinc-800 dark:hover:text-[#FAF4ED] active:scale-95 transition-all"
          aria-label="Show QR Code"
        >
          <div className="p-1 rounded-xl">
            <QrCode className="w-5 h-5 text-zinc-600 dark:text-[#D69E76]" />
          </div>
          <span className="text-[10px] tracking-tight">QR Code</span>
        </button>

      </div>
    </nav>
  );
}
