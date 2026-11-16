import React, { useState } from 'react';
import { 
  Coffee, 
  Settings as SettingsIcon, 
  LogOut, 
  ArrowLeft, 
  Upload, 
  Link as LinkIcon, 
  Save, 
  Shield,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMenu } from '../../context/MenuContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/api';
import AdminProductsTable from './AdminProductsTable';
import AdminCategoriesTable from './AdminCategoriesTable';

export default function AdminPortal() {
  const { user, logout, setIsAdminOpen } = useAuth();
  const { settings, updateSettings, refreshData } = useMenu();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('items'); // 'items' or 'settings'

  // Settings State
  const [houseName, setHouseName] = useState(settings.coffee_house_name || '');
  const [welcomeMsg, setWelcomeMsg] = useState(settings.welcome_message || '');
  const [welcomeMsgAm, setWelcomeMsgAm] = useState(settings.welcome_message_am || '');
  const [logoUrl, setLogoUrl] = useState(settings.logo_url || '');
  const [phone, setPhone] = useState(settings.phone || '');
  const [address, setAddress] = useState(settings.address || '');

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Sync state if settings change
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
      addToast('Coffee house name & settings updated successfully!', 'success');
      refreshData();
    } catch (err) {
      addToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2C1810] pt-4 pb-20 px-3.5 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Admin Header Bar with touch-friendly layout */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white border border-[#E8DFC8] shadow-xs">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4E342E] text-white flex items-center justify-center shadow-xs shrink-0">
              <Shield className="w-5 h-5 text-[#FFE082]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C1810]">
                  Admin Dashboard
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Manager
                </span>
              </div>
              <p className="text-xs text-[#8D6E63]">
                Manage drinks, snacks, prices & branding
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 xs:pt-0">
            <button
              onClick={() => setIsAdminOpen(false)}
              className="flex-1 xs:flex-none flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#3E2723] hover:bg-[#2C1810] active:scale-95 transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Menu</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center justify-center gap-1.5 min-h-[44px] px-3 rounded-xl text-xs sm:text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 active:scale-95 border border-rose-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

        </div>

        {/* Tab Selector - Mobile First 3-column responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 border-b border-[#E8DFC8] pb-3">
          <button
            onClick={() => setActiveTab('items')}
            className={`flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
              activeTab === 'items'
                ? 'bg-[#3E2723] text-white shadow-xs'
                : 'bg-white text-[#6D4C41] border border-[#E8DFC8] hover:bg-[#FAF6F0]'
            }`}
          >
            <Coffee className="w-4 h-4" />
            <span>Menu Items</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
              activeTab === 'categories'
                ? 'bg-[#3E2723] text-white shadow-xs'
                : 'bg-white text-[#6D4C41] border border-[#E8DFC8] hover:bg-[#FAF6F0]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
              activeTab === 'settings'
                ? 'bg-[#3E2723] text-white shadow-xs'
                : 'bg-white text-[#6D4C41] border border-[#E8DFC8] hover:bg-[#FAF6F0]'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Branding & Phone</span>
          </button>
        </div>

        {/* Tab 1: Products Management */}
        {activeTab === 'items' && (
          <div className="space-y-4">
            <AdminProductsTable />
          </div>
        )}

        {/* Tab 2: Categories Management */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            <AdminCategoriesTable />
          </div>
        )}

        {/* Tab 3: Coffee House Name & Logo Settings */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-[#E8DFC8] p-4 sm:p-8 shadow-xs max-w-2xl mx-auto">
            <form onSubmit={handleSaveSettings} className="space-y-4 sm:space-y-5">
              
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C1810]">
                  Coffee House Identity & Settings
                </h3>
                <p className="text-xs text-[#8D6E63] mt-0.5">
                  Update the brand name, logo, welcome note, and contact info displayed at the top of the menu.
                </p>
              </div>

              {/* Coffee House Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] mb-1">
                  Coffee House Name *
                </label>
                <input
                  type="text"
                  required
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  placeholder="Ever Coffee House"
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D7CCC8] text-base sm:text-sm text-[#2C1810] font-medium focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                />
              </div>

              {/* Welcome Message */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] mb-1">
                  Welcome Message
                </label>
                <textarea
                  rows={2}
                  value={welcomeMsg}
                  onChange={(e) => setWelcomeMsg(e.target.value)}
                  placeholder="Welcome message displayed below the logo and name..."
                  className="w-full p-3 rounded-xl border border-[#D7CCC8] text-base sm:text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 resize-none"
                />
              </div>

              {/* Welcome Message (Amharic) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] mb-1">
                  Welcome Message (Amharic / አማርኛ)
                </label>
                <textarea
                  rows={2}
                  value={welcomeMsgAm}
                  onChange={(e) => setWelcomeMsgAm(e.target.value)}
                  placeholder="የእንኳን ደህና መጡ መልእክት በአማርኛ..."
                  className="w-full p-3 rounded-xl border border-[#D7CCC8] text-base sm:text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30 resize-none"
                />
              </div>

              {/* Coffee House Logo Upload or URL */}
              <div className="space-y-2.5 p-3.5 sm:p-4 rounded-xl bg-[#FAF6F0] border border-[#E8DFC8]">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037]">
                  Coffee House Logo
                </label>
                
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <label className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-[#4E342E] text-white hover:bg-[#3E2723] active:scale-95 cursor-pointer transition-colors shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>Upload Logo Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>

                  <span className="text-xs text-[#8D6E63] font-medium text-center hidden sm:inline">or</span>

                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://... logo image URL"
                    className="flex-1 min-h-[44px] px-3 py-2 rounded-xl border border-[#D7CCC8] text-base sm:text-xs text-[#2C1810] bg-white focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                  />
                </div>

                {uploadingLogo && (
                  <p className="text-xs text-amber-700 animate-pulse font-medium">Uploading new logo...</p>
                )}

                {/* Logo Preview */}
                {logoUrl && (
                  <div className="flex items-center gap-3 pt-2">
                    <img
                      src={logoUrl}
                      alt="Logo preview"
                      className="w-14 h-14 object-contain rounded-xl bg-white border border-[#D7CCC8] p-1"
                    />
                    <span className="text-xs text-[#6D4C41] font-medium">Active Logo Preview</span>
                  </div>
                )}
              </div>

              {/* Phone & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0970414440"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D7CCC8] text-base sm:text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] mb-1">
                    Address / City
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Bole, Addis Ababa, Ethiopia"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D7CCC8] text-base sm:text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 min-h-[48px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#4E342E] hover:bg-[#3E2723] active:scale-95 transition-all shadow-xs disabled:opacity-50 ml-auto"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
