import React from 'react';
import { Coffee, Shield, Lock, Send, Instagram, Facebook, ArrowUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
  const { isAuthenticated, setShowLoginModal, setIsAdminOpen, isAdminOpen } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white text-zinc-600 border-t border-zinc-200/90 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-zinc-200">
          
          {/* Col 1: Brand & Bio */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-white shadow-sm">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <span className="font-serif text-2xl font-bold text-zinc-950">
                  Keffa & Bunna
                </span>
                <span className="block text-[11px] uppercase tracking-widest text-amber-700 font-semibold">
                  Addis Ababa • Ethiopia
                </span>
              </div>
            </div>

            <p className="text-sm text-zinc-500 leading-relaxed max-w-sm font-light">
              Celebrating Ethiopia as the birthplace of coffee. Fresh traditional Jebena Buna, rich velvety macchiatos, herbal teas, cold-pressed juices, and bakery pastries served daily in Addis Ababa.
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-amber-700 flex items-center justify-center transition-colors border border-zinc-200"
                aria-label="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-amber-700 flex items-center justify-center transition-colors border border-zinc-200"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 hover:text-amber-700 flex items-center justify-center transition-colors border border-zinc-200"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Menu Categories Quick Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-serif text-base font-bold text-zinc-950">
              Menu Categories
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <a href="#menu" className="hover:text-amber-700 transition-colors">
                  Traditional Buna & Espresso
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-amber-700 transition-colors">
                  Ethiopian Shai & Spiced Teas
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-amber-700 transition-colors">
                  Layered Spris & Fresh Juices
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-amber-700 transition-colors">
                  Biscuits, Cookies & Snacks
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-amber-700 transition-colors">
                  Cakes, Pastries & Bakery
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif text-base font-bold text-zinc-950">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li>
                <a href="#home" className="hover:text-amber-700 transition-colors">
                  Home
                </a>
              </li>
              <li>
                <a href="#menu" className="hover:text-amber-700 transition-colors">
                  Digital Menu
                </a>
              </li>
              <li>
                <a href="#featured" className="hover:text-amber-700 transition-colors">
                  Signature Roasts
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-amber-700 transition-colors">
                  Coffee Heritage
                </a>
              </li>
              <li>
                <a href="#hours" className="hover:text-amber-700 transition-colors">
                  Hours & Address
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Administrator Management */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-serif text-base font-bold text-zinc-950">
              Management
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Secure administrator portal for real-time menu editing, price updates, and inventory status.
            </p>
            {isAuthenticated ? (
              <button
                onClick={() => setIsAdminOpen(!isAdminOpen)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                {isAdminOpen ? 'Close Dashboard' : 'Open Dashboard'}
              </button>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                Admin Login
              </button>
            )}
          </div>

        </div>

        {/* Bottom Copyright & Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p className="flex items-center gap-1.5 text-center sm:text-left">
            <span>© {new Date().getFullYear()} Keffa & Bunna Coffee House. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-amber-800 font-medium">Bole Medhanialem, Addis Ababa, Ethiopia</span>
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-amber-700 transition-colors font-medium text-zinc-600"
          >
            <span>Back to top</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
}
