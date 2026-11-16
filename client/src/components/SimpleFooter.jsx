import React from 'react';
import { Coffee, Phone, MapPin, QrCode } from 'lucide-react';
import { useMenu } from '../context/MenuContext';

export default function SimpleFooter() {
  const { settings, setIsMobileQrOpen } = useMenu();
  const phoneDisplay = settings.phone || '0970414440';
  const houseName = settings.coffee_house_name || 'Ever Coffee House';

  return (
    <footer className="mt-12 bg-zinc-50 dark:bg-[#1A0E08] border-t border-zinc-200 dark:border-[#3A2012] pt-8 pb-24 md:pb-8 px-4 text-center text-xs text-zinc-600 dark:text-[#A89080] transition-colors duration-200">
      <div className="max-w-md mx-auto space-y-3.5">
        
        <div className="flex items-center justify-center gap-2">
          <Coffee className="w-4 h-4 text-[#5D4037] dark:text-[#D4AF37]" />
          <span className="font-serif font-bold text-base text-zinc-900 dark:text-[#FAF4ED]">
            {houseName}
          </span>
        </div>

        {/* Address & Clickable Tap-to-Call Phone */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-600 dark:text-[#D69E76]">
          <span className="inline-flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 dark:text-[#D69E76]" />
            <span>{settings.address || 'Addis Ababa, Ethiopia'}</span>
          </span>
          <span className="text-zinc-300 dark:text-[#3A2012]">•</span>
          <a
            href={`tel:${phoneDisplay.replace(/[^0-9+]/g, '')}`}
            className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1 rounded-full bg-white dark:bg-[#2A170D] border border-zinc-200 dark:border-[#3A2012] text-zinc-800 dark:text-[#FAF4ED] font-semibold hover:bg-zinc-100 dark:hover:bg-[#3A2012] active:scale-95 transition-all shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-[#5D4037] dark:text-[#D4AF37]" />
            <span>{phoneDisplay}</span>
          </a>
        </div>

        <div className="pt-1 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => setIsMobileQrOpen(true)}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#2A170D] text-zinc-800 dark:text-[#FAF4ED] hover:bg-zinc-100 dark:hover:bg-[#3A2012] border border-zinc-200 dark:border-[#3A2012] active:scale-95 transition-all shadow-2xs"
          >
            <QrCode className="w-4 h-4 text-[#795548] dark:text-[#D4AF37]" />
            <span>Open on Phone (QR)</span>
          </button>
        </div>

        <p className="text-[10px] text-zinc-400 dark:text-[#7A6050] pt-2">
          © {new Date().getFullYear()} {houseName}. Digital Menu Only.
        </p>

      </div>
    </footer>
  );
}
