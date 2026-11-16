import React from 'react';
import { Coffee, Lock, Shield, Phone, MapPin, QrCode } from 'lucide-react';
import { useMenu } from '../context/MenuContext';
import { useAuth } from '../context/AuthContext';

export default function SimpleFooter() {
  const { settings, setIsMobileQrOpen } = useMenu();
  const { isAuthenticated, setShowLoginModal, setIsAdminOpen, isAdminOpen } = useAuth();
  const phoneDisplay = settings.phone || '0970414440';
  const houseName = settings.coffee_house_name || 'Ever Coffee House';

  return (
    <footer className="mt-12 bg-[#FAF6F0] border-t border-[#E8DFC8] pt-8 pb-24 md:pb-8 px-4 text-center text-xs text-[#8D6E63]">
      <div className="max-w-md mx-auto space-y-3.5">
        
        <div className="flex items-center justify-center gap-2">
          <Coffee className="w-4 h-4 text-[#5D4037]" />
          <span className="font-serif font-bold text-base text-[#2C1810]">
            {houseName}
          </span>
        </div>

        {/* Address & Clickable Tap-to-Call Phone */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-[#6D4C41]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#A1887F]" />
            <span>{settings.address || 'Addis Ababa, Ethiopia'}</span>
          </span>
          <span className="text-[#D7CCC8]">•</span>
          <a
            href={`tel:${phoneDisplay.replace(/[^0-9+]/g, '')}`}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1 rounded-full bg-white border border-[#D7CCC8] text-[#3E2723] font-semibold hover:bg-[#EFEBE9] active:scale-95 transition-all shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-[#5D4037]" />
            <span>{phoneDisplay}</span>
          </a>
        </div>

        <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => setIsMobileQrOpen(true)}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-[#5D4037] hover:bg-[#EFEBE9] border border-[#D7CCC8] active:scale-95 transition-all shadow-2xs"
          >
            <QrCode className="w-4 h-4 text-[#795548]" />
            <span>Open on Phone (QR)</span>
          </button>

          {isAuthenticated ? (
            <button
              onClick={() => setIsAdminOpen(!isAdminOpen)}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#4E342E] text-white hover:bg-[#3E2723] active:scale-95 transition-all shadow-xs"
            >
              <Shield className="w-4 h-4 text-[#FFE082]" />
              <span>{isAdminOpen ? 'Back to Customer Menu' : 'Open Admin Dashboard'}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-1 min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-medium text-[#8D6E63] hover:text-[#3E2723] hover:bg-[#EFEBE9]/60 active:scale-95 transition-all"
            >
              <Lock className="w-3.5 h-3.5 text-[#A1887F]" />
              <span>Admin Dashboard</span>
            </button>
          )}
        </div>

        <p className="text-[10px] text-[#BCAAA4] pt-2">
          © {new Date().getFullYear()} {houseName}. Digital Menu Only.
        </p>

      </div>
    </footer>
  );
}
