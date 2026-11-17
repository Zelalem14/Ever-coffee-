import React from 'react';
import { Coffee, Shield, Lock, MapPin, Phone, QrCode, Sun, Moon } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import MobileQrModal from './MobileQrModal';

export default function Header() {
  const { settings, isMobileQrOpen, setIsMobileQrOpen, qrTargetProductId, setQrTargetProductId } = useMenu();
  const { isAuthenticated, setShowLoginModal, isAdminOpen, setIsAdminOpen } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="bg-gradient-to-b from-white via-zinc-50/60 to-white dark:from-[#1F1009] dark:via-[#1A0E08] dark:to-[#120804] border-b border-zinc-200 dark:border-[#3A2012] pt-3 pb-6 px-3.5 sm:px-6 transition-colors duration-200">
      <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
        
        {/* Top utility row: Location, Phone & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-100 dark:border-[#3A2012]/60 pb-2.5">
          
          {/* Location & Phone (Clickable Call Link for Mobile Phones) */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600 dark:text-[#D69E76] font-medium min-h-[36px]">
            <span className="inline-flex items-center gap-1.5 bg-zinc-100/90 dark:bg-[#2A170D] px-2.5 py-1.5 rounded-xl border border-zinc-200/90 dark:border-[#3A2012]">
              <MapPin className="w-3.5 h-3.5 text-zinc-500 dark:text-[#D69E76] shrink-0" />
              <span className="truncate max-w-[140px] xs:max-w-none text-zinc-700 dark:text-[#FAF4ED] font-medium">
                {settings.address || 'Addis Ababa, Ethiopia'}
              </span>
            </span>

            <a 
              href={`tel:${(settings.phone || '0970414440').replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center gap-1.5 min-h-[36px] bg-zinc-100/90 dark:bg-[#2A170D] px-3 py-1.5 rounded-xl border border-zinc-200/90 dark:border-[#3A2012] text-zinc-800 dark:text-[#FAF4ED] font-semibold hover:bg-zinc-200/80 dark:hover:bg-[#3A2012] active:scale-95 transition-all shadow-2xs"
              title="Tap to call Ever Coffee House"
            >
              <Phone className="w-3.5 h-3.5 text-[#5D4037] dark:text-[#D4AF37] shrink-0" />
              <span>{settings.phone || '0970414440'}</span>
            </a>
          </div>

          {/* Header Action Buttons with >=44px touch targets */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Prominent Theme Toggle Button with Sun and Moon Icons */}
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-1.5 min-h-[44px] px-3 sm:px-3.5 rounded-xl border transition-all duration-200 active:scale-95 shadow-2xs ${
                isDark 
                  ? 'bg-[#2A170D] hover:bg-[#3A2012] border-[#3A2012] text-amber-300' 
                  : 'bg-zinc-100 hover:bg-zinc-200/80 border-zinc-200 text-zinc-800'
              }`}
              title={isDark ? "Switch to Bright Mode" : "Switch to Dark Mode"}
              aria-label={isDark ? "Switch to Bright Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400 shrink-0 transition-transform duration-300 hover:rotate-45" />
                  <span className="text-xs font-bold text-[#FAF4ED]">Bright</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600 shrink-0 transition-transform duration-300 hover:-rotate-12" />
                  <span className="text-xs font-bold text-zinc-800">Dark</span>
                </>
              )}
            </button>

            {/* Open on Phone / QR Button */}
            <button
              onClick={() => setIsMobileQrOpen(true)}
              className="flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl text-xs font-semibold bg-zinc-100/90 dark:bg-[#2A170D] text-zinc-800 dark:text-[#FAF4ED] hover:bg-zinc-200/80 dark:hover:bg-[#3A2012] border border-zinc-200/90 dark:border-[#3A2012] transition-colors shadow-2xs active:scale-95"
              title="Open on mobile phone via Wi-Fi QR"
              aria-label="Open mobile QR code"
            >
              <QrCode className="w-4 h-4 text-[#795548] dark:text-[#D4AF37]" />
              <span className="hidden xs:inline">QR</span> Code
            </button>

            {isAuthenticated ? (
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className="flex items-center gap-1.5 min-h-[44px] px-3.5 rounded-xl text-xs font-semibold bg-[#4E342E] dark:bg-[#D4AF37] text-white dark:text-[#120804] hover:bg-[#3E2723] dark:hover:bg-[#E9C053] active:scale-95 transition-all shadow-xs"
                aria-label="Toggle Admin Portal"
              >
                <Shield className="w-4 h-4 text-[#FFE082] dark:text-[#120804]" />
                <span>{isAdminOpen ? 'Menu' : 'Admin'}</span>
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 min-h-[44px] px-3 rounded-xl text-xs font-semibold text-zinc-600 dark:text-[#D69E76] hover:text-zinc-900 dark:hover:text-[#FAF4ED] hover:bg-zinc-100 dark:hover:bg-[#2A170D] active:bg-zinc-200 border border-transparent hover:border-zinc-200 dark:hover:border-[#3A2012] transition-colors"
                title="Admin Login"
                aria-label="Admin Login"
              >
                <Lock className="w-3.5 h-3.5 text-zinc-400 dark:text-[#D69E76]" />
                <span className="hidden xs:inline">Admin</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Hero: Logo, Name & Welcoming Note */}
        <div className="text-center pt-1 pb-1 space-y-2.5">
          
          {/* Logo & Brand Area */}
          <div className="flex flex-col items-center gap-2">
            {settings.logo_url ? (
              <img
                src={settings.logo_url}
                alt={settings.coffee_house_name || 'Ever Coffee House'}
                className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 object-contain rounded-2xl shadow-md border-2 border-zinc-200 dark:border-[#3A2012] p-1 bg-white dark:bg-[#2A170D]"
              />
            ) : (
              <div className="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[#5D4037] via-[#4E342E] to-[#3E2723] dark:from-[#3E2723] dark:via-[#2C1810] dark:to-[#1F1009] flex items-center justify-center text-white shadow-lg shadow-[#3E2723]/15 border-2 border-zinc-200 dark:border-[#D4AF37]/40">
                <Coffee className="w-8 h-8 xs:w-10 xs:h-10 sm:w-11 sm:h-11 text-[#FFE082] dark:text-[#D4AF37]" />
              </div>
            )}
          </div>

          {/* Coffee House Name */}
          <div className="space-y-0.5">
            <h1 className="font-serif text-2xl xs:text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-[#FAF4ED] tracking-tight leading-tight">
              {settings.coffee_house_name || 'Ever Coffee House'}
            </h1>
            <p className="text-[11px] sm:text-xs uppercase tracking-widest text-zinc-500 dark:text-[#D69E76] font-bold">
              Digital Menu
            </p>
          </div>

          {/* Welcome Messages (English & Amharic) */}
          <div className="max-w-xl mx-auto space-y-1 px-2">
            <p className="text-xs xs:text-sm sm:text-base text-zinc-700 dark:text-[#D69E76] leading-relaxed font-light">
              {settings.welcome_message || 'Welcome to Ever Coffee House! Browse our freshly brewed coffee, refreshing drinks, and delicious snacks.'}
            </p>
            {(settings.welcome_message_am || 'እንኳን ወደ ኤቨር ቡና ቤት በደህና መጡ! ትኩስ ቡና፣ መጠጦች እና መክሰሶችን ይመልከቱ።') && (
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-[#A89080] leading-relaxed font-normal">
                {settings.welcome_message_am || 'እንኳን ወደ ኤቨር ቡና ቤት በደህና መጡ! ትኩስ ቡና፣ መጠጦች እና መክሰሶችን ይመልከቱ።'}
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Mobile QR Modal */}
      <MobileQrModal
        isOpen={isMobileQrOpen}
        onClose={() => {
          setIsMobileQrOpen(false);
          setQrTargetProductId(null);
        }}
        initialProductId={qrTargetProductId}
      />
    </header>
  );
}
