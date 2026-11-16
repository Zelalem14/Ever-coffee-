import React from 'react';
import { Layers, Coffee, Cookie, QrCode, Lock, Shield, Search } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';

export default function MobileBottomNav() {
  const { activeTab, setActiveTab, setIsMobileQrOpen, drinksProducts, foodProducts, products } = useMenu();
  const { isAuthenticated, setShowLoginModal, isAdminOpen, setIsAdminOpen } = useAuth();

  const handleTabClick = (tabKey) => {
    setActiveTab(tabKey);
    // Smooth scroll to top of menu
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setIsAdminOpen(!isAdminOpen);
    } else {
      setShowLoginModal(true);
    }
  };

  const isDrinksActive = activeTab === 'drinks' || String(activeTab).toLowerCase().includes('drink');
  const isFoodsActive = activeTab === 'foods' || activeTab === 'foods-snacks' || String(activeTab).toLowerCase().includes('snack') || String(activeTab).toLowerCase().includes('food');

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8DFC8] shadow-[0_-4px_20px_rgba(44,24,16,0.06)] pb-safe"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1 items-stretch">
        
        {/* Tab 1: All Menu */}
        <button
          onClick={() => handleTabClick('all')}
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition-all active:scale-95 ${
            activeTab === 'all'
              ? 'text-[#3E2723] font-bold'
              : 'text-[#8D6E63] hover:text-[#5D4037]'
          }`}
          aria-label="All Menu"
        >
          <div className={`p-1 rounded-xl transition-colors ${
            activeTab === 'all' ? 'bg-[#EFEBE9]' : ''
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
              ? 'text-[#3E2723] font-bold'
              : 'text-[#8D6E63] hover:text-[#5D4037]'
          }`}
          aria-label="Drinks"
        >
          <div className={`p-1 rounded-xl transition-colors ${
            isDrinksActive ? 'bg-[#EFEBE9]' : ''
          }`}>
            <Coffee className="w-5 h-5 text-[#8D6E63]" />
          </div>
          <span className="text-[10px] tracking-tight">Drinks</span>
        </button>

        {/* Tab 3: Snacks */}
        <button
          onClick={() => handleTabClick('foods')}
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition-all active:scale-95 ${
            isFoodsActive
              ? 'text-[#3E2723] font-bold'
              : 'text-[#8D6E63] hover:text-[#5D4037]'
          }`}
          aria-label="Snacks and Foods"
        >
          <div className={`p-1 rounded-xl transition-colors ${
            isFoodsActive ? 'bg-[#EFEBE9]' : ''
          }`}>
            <Cookie className="w-5 h-5 text-[#8D6E63]" />
          </div>
          <span className="text-[10px] tracking-tight">Snacks</span>
        </button>

        {/* Tab 4: QR Code */}
        <button
          onClick={() => setIsMobileQrOpen(true)}
          className="flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 text-[#8D6E63] hover:text-[#5D4037] active:scale-95 transition-all"
          aria-label="Show QR Code"
        >
          <div className="p-1 rounded-xl">
            <QrCode className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight">QR Code</span>
        </button>

        {/* Tab 5: Admin */}
        <button
          onClick={handleAdminClick}
          className={`flex flex-col items-center justify-center gap-1 min-h-[48px] py-1 transition-all active:scale-95 ${
            isAdminOpen 
              ? 'text-[#3E2723] font-bold' 
              : 'text-[#8D6E63] hover:text-[#5D4037]'
          }`}
          aria-label="Admin Portal"
        >
          <div className={`p-1 rounded-xl ${isAdminOpen ? 'bg-[#EFEBE9]' : ''}`}>
            {isAuthenticated ? (
              <Shield className="w-5 h-5 text-[#5D4037]" />
            ) : (
              <Lock className="w-5 h-5" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">
            {isAuthenticated ? (isAdminOpen ? 'Menu' : 'Admin') : 'Login'}
          </span>
        </button>

      </div>
    </nav>
  );
}
