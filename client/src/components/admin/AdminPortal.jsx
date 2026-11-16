import React, { useState } from 'react';
import { 
  Coffee, 
  Settings as SettingsIcon, 
  LogOut, 
  ArrowLeft, 
  Upload, 
  Save, 
  Shield, 
  Layers, 
  Users, 
  Activity, 
  Menu as MenuIcon, 
  X, 
  Moon, 
  Sun,
  LayoutDashboard,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/api';
import AdminStats from './AdminStats';
import AdminProductsTable from './AdminProductsTable';
import AdminCategoriesTable from './AdminCategoriesTable';
import AdminUsersTable from './AdminUsersTable';
import AdminLogsTable from './AdminLogsTable';

export default function AdminPortal() {
  const { user, logout, setIsAdminOpen, isAdmin, isManager } = useAuth();
  const { settings, updateSettings, refreshData } = useMenu();
  const { isDark, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'items', 'categories', 'users', 'logs', 'settings'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Settings State
  const [houseName, setHouseName] = useState(settings.coffee_house_name || '');
  const [welcomeMsg, setWelcomeMsg] = useState(settings.welcome_message || '');
  const [welcomeMsgAm, setWelcomeMsgAm] = useState(settings.welcome_message_am || '');
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [address, setAddress] = useState(settings.address || '');

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  React.useEffect(() => {
    setHouseName(settings.coffee_house_name || '');
    setWelcomeMsg(settings.welcome_message || '');
    setWelcomeMsgAm(settings.welcome_message_am || '');
    setLogoUrl(settings.logo_url || '');
    setPhone(settings.phone || '');
    setAddress(settings.address || '');
  }, [settings]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const res = await api.uploadImage(file);
      setLogoUrl(res.url);
      addToast('Logo uploaded successfully!', 'success');
    } catch (err) {
      addToast(err.message || 'Logo upload failed', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!houseName.trim()) {
      addToast('Coffee house name is required', 'error');
      return;
    }

    try {
      setSavingSettings(true);
      await updateSettings({
        coffee_house_name: houseName.trim(),
        welcome_message: welcomeMsg.trim(),
        welcome_message_am: welcomeMsgAm.trim(),
        logo_url: logoUrl.trim(),
        phone: phone.trim(),
        address: address.trim()
      });
      addToast('Coffee house settings updated successfully!', 'success');
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview & Stats', icon: LayoutDashboard },
    { id: 'items', label: 'Menu Items', icon: Coffee },
    { id: 'categories', label: 'Categories', icon: Layers },
    ...(isManager ? [{ id: 'users', label: 'Users & Roles', icon: Users }] : []),
    ...(isManager ? [{ id: 'logs', label: 'Activity Logs', icon: Activity }] : []),
    { id: 'settings', label: 'Branding & Phone', icon: SettingsIcon }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen flex bg-[#FDFBF7] dark:bg-[#120804] text-[#2C1810] dark:text-[#FAF4ED] transition-colors">
      
      {/* ======================================================== */}
      {/* 1. DESKTOP SIDEBAR (hidden on mobile, visible md:flex)    */}
      {/* ======================================================== */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-white dark:bg-[#1F1009] border-r border-[#E8DFC8] dark:border-[#3A2012] min-h-screen p-5 justify-between">
        <div className="space-y-6">
          
          {/* Logo & House Title */}
          <div className="flex items-center gap-3 pb-5 border-b border-[#E8DFC8] dark:border-[#3A2012]">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4E342E] to-[#2C1810] text-[#D4AF37] flex items-center justify-center font-serif text-lg font-bold shadow-md shrink-0">
              ☕
            </div>
            <div className="overflow-hidden">
              <h1 className="font-serif font-bold text-sm text-[#2C1810] dark:text-[#FAF4ED] truncate">
                {settings.coffee_house_name || 'Ever Coffee House'}
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-[#8D6E63] dark:text-[#D69E76] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Admin Portal
              </span>
            </div>
          </div>

          {/* Current User Profile Card */}
          <div className="p-3 rounded-2xl bg-[#FAF6F0] dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] flex items-center justify-center font-bold text-xs shrink-0">
                {(user?.username || 'A').slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-[#2C1810] dark:text-[#FAF4ED] truncate">
                  {user?.name || user?.username || 'Admin'}
                </p>
                <p className="text-[10px] text-[#8D6E63] dark:text-[#A89080] truncate">
                  @{user?.username}
                </p>
              </div>
            </div>

            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
              user?.role === 'admin' 
                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
            }`}>
              {user?.role || 'admin'}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 min-h-[44px] px-3.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-xs'
                      : 'text-[#5D4037] dark:text-[#D69E76] hover:bg-[#FAF6F0] dark:hover:bg-[#2A170D]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white dark:text-[#120804]' : 'text-[#8D6E63] dark:text-[#A89080]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="space-y-2 pt-4 border-t border-[#E8DFC8] dark:border-[#3A2012]">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between min-h-[40px] px-3.5 rounded-xl text-xs font-semibold text-[#5D4037] dark:text-[#D69E76] hover:bg-[#FAF6F0] dark:hover:bg-[#2A170D] transition-colors"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-[#8D6E63]">{isDark ? 'Dark' : 'Light'}</span>
          </button>

          {/* Back to Customer Menu */}
          <button
            onClick={() => setIsAdminOpen(false)}
            className="w-full flex items-center gap-2 min-h-[40px] px-3.5 rounded-xl text-xs font-semibold text-[#3E2723] dark:text-[#FAF4ED] bg-[#FAF6F0] dark:bg-[#2A170D] hover:bg-[#EFEBE9] dark:hover:bg-[#3A2012] border border-[#E8DFC8] dark:border-[#3A2012] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Menu</span>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 min-h-[40px] px-3.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 border border-rose-200 dark:border-rose-900 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Secure Logout</span>
          </button>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE DRAWER NAVIGATION (Slide-out menu for mobile)    */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-xs flex animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="w-72 bg-white dark:bg-[#1F1009] h-full p-5 flex flex-col justify-between shadow-2xl border-r border-[#E8DFC8] dark:border-[#3A2012] animate-slideRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-[#E8DFC8] dark:border-[#3A2012]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#3E2723] text-white flex items-center justify-center font-bold text-sm">
                    ☕
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-xs text-[#2C1810] dark:text-[#FAF4ED]">
                      {settings.coffee_house_name || 'Ever Coffee House'}
                    </h3>
                    <p className="text-[10px] text-[#8D6E63]">Admin Menu</p>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#8D6E63] hover:bg-[#FAF6F0]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Navigation List */}
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 min-h-[44px] px-3.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-xs'
                          : 'text-[#5D4037] dark:text-[#D69E76] hover:bg-[#FAF6F0] dark:hover:bg-[#2A170D]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Drawer Bottom Actions */}
            <div className="space-y-2 pt-4 border-t border-[#E8DFC8] dark:border-[#3A2012]">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center justify-between min-h-[40px] px-3.5 rounded-xl text-xs font-semibold text-[#5D4037] dark:text-[#D69E76] hover:bg-[#FAF6F0] dark:hover:bg-[#2A170D]"
              >
                <span className="flex items-center gap-2">
                  {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
                  <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                </span>
              </button>

              <button
                onClick={() => {
                  setIsAdminOpen(false);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 min-h-[44px] px-3.5 rounded-xl text-xs font-semibold text-[#3E2723] dark:text-[#FAF4ED] bg-[#FAF6F0] dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012]"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Customer Menu</span>
              </button>

              <button
                onClick={logout}
                className="w-full flex items-center gap-2 min-h-[44px] px-3.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MAIN DASHBOARD CONTENT AREA                            */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-[#1F1009]/90 backdrop-blur-md border-b border-[#E8DFC8] dark:border-[#3A2012] px-3.5 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger button on mobile */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-[#FAF6F0] dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] text-[#2C1810] dark:text-[#FAF4ED] active:scale-95"
              aria-label="Toggle navigation menu"
            >
              <MenuIcon className="w-5 h-5" />
            </button>

            <div>
              <h2 className="font-serif text-base sm:text-lg font-bold text-[#2C1810] dark:text-[#FAF4ED] capitalize">
                {activeTab === 'overview' ? 'Dashboard Overview' :
                 activeTab === 'items' ? 'Menu Items Management' :
                 activeTab === 'categories' ? 'Menu Categories' :
                 activeTab === 'users' ? 'User Accounts & Roles' :
                 activeTab === 'logs' ? 'Activity & Security Logs' :
                 'Branding & Phone Settings'}
              </h2>
              <p className="text-[11px] text-[#8D6E63] dark:text-[#A89080] hidden xs:block">
                Ever Coffee House · Admin Control Panel
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle Button in Header */}
            <button
              onClick={toggleTheme}
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-[#FAF6F0] dark:bg-[#2A170D] text-[#5D4037] dark:text-[#D69E76] hover:bg-[#EFEBE9] active:scale-95 transition-all"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-600" />}
            </button>

            {/* Quick Back to Menu Button */}
            <button
              onClick={() => setIsAdminOpen(false)}
              className="hidden sm:flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-xs font-semibold text-white bg-[#3E2723] dark:bg-[#D4AF37] dark:text-[#120804] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-95 transition-all shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Menu</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 min-h-[40px] px-3 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 active:scale-95 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="p-3.5 sm:p-6 space-y-6 max-w-7xl mx-auto w-full pb-20">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <AdminStats onNavigate={handleNavClick} />
          )}

          {/* TAB 2: MENU ITEMS */}
          {activeTab === 'items' && (
            <AdminProductsTable />
          )}

          {/* TAB 3: CATEGORIES */}
          {activeTab === 'categories' && (
            <AdminCategoriesTable />
          )}

          {/* TAB 4: USERS & ROLES */}
          {activeTab === 'users' && isManager && (
            <AdminUsersTable />
          )}

          {/* TAB 5: AUDIT LOGS */}
          {activeTab === 'logs' && isManager && (
            <AdminLogsTable />
          )}

          {/* TAB 6: BRANDING & SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white dark:bg-[#2A170D] rounded-2xl border border-[#E8DFC8] dark:border-[#3A2012] p-4 sm:p-8 shadow-xs max-w-2xl mx-auto">
              <form onSubmit={handleSaveSettings} className="space-y-4 sm:space-y-5">
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C1810] dark:text-[#FAF4ED]">
                    Coffee House Identity & Settings
                  </h3>
                  <p className="text-xs text-[#8D6E63] dark:text-[#A89080] mt-0.5">
                    Update the brand name, logo, phone number, and welcome message displayed at the top of the menu.
                  </p>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                    Coffee House Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={houseName}
                    onChange={(e) => setHouseName(e.target.value)}
                    placeholder="Ever Coffee House"
                    className="w-full min-h-[44px] p-3 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                    Contact Phone Number (Clickable for mobile calls)
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0970414440"
                    className="w-full min-h-[44px] p-3 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] font-mono focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                    Location / Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Addis Ababa, Ethiopia"
                    className="w-full min-h-[44px] p-3 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                  />
                </div>

                {/* Welcome Message (English) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                    Welcome Message (English)
                  </label>
                  <textarea
                    rows={2}
                    value={welcomeMsg}
                    onChange={(e) => setWelcomeMsg(e.target.value)}
                    placeholder="Welcome message displayed below the logo and name..."
                    className="w-full p-3 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 resize-none"
                  />
                </div>

                {/* Welcome Message (Amharic) */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                    Welcome Message (Amharic / አማርኛ)
                  </label>
                  <textarea
                    rows={2}
                    value={welcomeMsgAm}
                    onChange={(e) => setWelcomeMsgAm(e.target.value)}
                    placeholder="የእንኳን ደህና መጡ መልእክት በአማርኛ..."
                    className="w-full p-3 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 resize-none"
                  />
                </div>

                {/* Logo URL or Upload */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                    Coffee House Logo (Image URL or Upload)
                  </label>
                  
                  <div className="flex gap-2 mb-2">
                    <input
                      type="url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="flex-1 min-h-[44px] p-3 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                    />

                    <label className="min-h-[44px] px-4 rounded-xl bg-[#FAF6F0] dark:bg-[#1F1009] border border-[#D7CCC8] dark:border-[#3A2012] text-[#3E2723] dark:text-[#D69E76] flex items-center justify-center gap-1.5 cursor-pointer hover:bg-[#EFEBE9] text-xs font-bold shrink-0">
                      <Upload className="w-4 h-4" />
                      <span>{uploadingLogo ? '...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {logoUrl && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#1F1009] border border-[#E8DFC8] dark:border-[#3A2012]">
                      <img
                        src={logoUrl}
                        alt="Logo Preview"
                        className="w-12 h-12 object-contain rounded-lg bg-white border border-[#D7CCC8]"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div className="text-xs text-[#8D6E63] dark:text-[#A89080]">
                        <p className="font-semibold text-[#2C1810] dark:text-[#FAF4ED]">Logo Preview</p>
                        <p className="text-[10px] truncate max-w-xs">{logoUrl}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="w-full min-h-[48px] py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#3E2723] dark:bg-[#D4AF37] dark:text-[#120804] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-[0.98] transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? 'Saving Settings...' : 'Save Settings'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </main>
      </div>

    </div>
  );
}
