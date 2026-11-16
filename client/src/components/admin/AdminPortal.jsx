import React, { useState } from 'react';
import { 
  Coffee, 
  KeyRound, 
  LogOut, 
  ExternalLink, 
  Moon, 
  Sun,
  UtensilsCrossed,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import { useTheme } from '../../context/ThemeContext';
import AdminProductsTable from './AdminProductsTable';
import AdminAccountSettings from './AdminAccountSettings';

export default function AdminPortal() {
  const { user, logout, setIsAdminOpen } = useAuth();
  const { settings } = useMenu();
  const { isDark, toggleTheme } = useTheme();

  // ONLY 2 tabs: 'menu' (Manage Menu) and 'account' (Account Settings)
  const [activeTab, setActiveTab] = useState('menu');

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#120804] text-[#2C1810] dark:text-[#FAF4ED] transition-colors flex flex-col">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#1F1009]/95 backdrop-blur-md border-b border-[#E8DFC8] dark:border-[#3A2012] px-3.5 sm:px-6 py-3 transition-colors shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4E342E] to-[#2C1810] dark:from-[#D4AF37] dark:to-[#8D6E63] text-[#FFE082] dark:text-[#120804] flex items-center justify-center font-serif text-lg font-bold shadow-xs shrink-0">
              ☕
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-base sm:text-lg text-[#2C1810] dark:text-[#FAF4ED] leading-tight">
                  {settings.coffee_house_name || 'Ever Coffee House'}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#EFEBE9] dark:bg-[#2A170D] text-[#5D4037] dark:text-[#D69E76] border border-[#D7CCC8]/60 dark:border-[#3A2012]">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-[#8D6E63] dark:text-[#A89080] font-mono">
                Logged in as @{user?.username}
              </p>
            </div>
          </div>

          {/* Right Header Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-[#FAF6F0] dark:bg-[#2A170D] text-[#5D4037] dark:text-[#D69E76] hover:bg-[#EFEBE9] active:scale-95 transition-all"
              title="Toggle theme (Light / Dark)"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
            </button>

            {/* Back to Public Menu Button */}
            <button
              onClick={() => setIsAdminOpen(false)}
              className="flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-xs font-semibold text-[#3E2723] dark:text-[#FAF4ED] bg-[#FAF6F0] dark:bg-[#2A170D] hover:bg-[#EFEBE9] dark:hover:bg-[#3A2012] border border-[#D7CCC8] dark:border-[#3A2012] active:scale-95 transition-all shadow-2xs"
              title="View customer menu"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Public Menu</span>
              <span className="sm:hidden">Menu</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 active:scale-95 transition-all"
              title="Secure logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-3.5 sm:px-6 py-5 sm:py-7 space-y-6">
        
        {/* Navigation Tabs: ONLY 2 SECTIONS (Manage Menu & Account Settings) */}
        <div className="flex justify-center">
          <nav 
            aria-label="Admin Navigation"
            className="inline-flex p-1.5 rounded-2xl bg-[#EFEBE9] dark:bg-[#1F1009] border border-[#D7CCC8] dark:border-[#3A2012] shadow-2xs w-full sm:w-auto max-w-md"
          >
            {/* Tab 1: Manage Menu */}
            <button
              onClick={() => setActiveTab('menu')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                activeTab === 'menu'
                  ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-xs'
                  : 'text-[#5D4037] dark:text-[#D69E76] hover:text-[#2C1810] dark:hover:text-[#FAF4ED]'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Manage Menu</span>
            </button>

            {/* Tab 2: Account Settings */}
            <button
              onClick={() => setActiveTab('account')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                activeTab === 'account'
                  ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-xs'
                  : 'text-[#5D4037] dark:text-[#D69E76] hover:text-[#2C1810] dark:hover:text-[#FAF4ED]'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Account Settings</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'menu' && (
          <div className="animate-fadeIn">
            <AdminProductsTable />
          </div>
        )}

        {activeTab === 'account' && (
          <div className="animate-fadeIn">
            <AdminAccountSettings />
          </div>
        )}

      </main>

      {/* Footer info */}
      <footer className="py-4 text-center text-[11px] text-[#A1887F] dark:text-[#7A6050] border-t border-[#E8DFC8]/60 dark:border-[#3A2012]">
        Ever Coffee House · Admin Control Panel · Menu Management & Account Security
      </footer>

    </div>
  );
}
