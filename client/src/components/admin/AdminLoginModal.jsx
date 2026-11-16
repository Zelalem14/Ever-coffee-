import React, { useState } from 'react';
import { X, Lock, User, Key, Eye, EyeOff, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLoginModal() {
  const { showLoginModal, setShowLoginModal, login } = useAuth();
  const { addToast } = useToast();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  if (!showLoginModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLocked(false);
    setLoading(true);

    try {
      await login(username, password);
      addToast('Welcome to Ever Coffee House Dashboard!', 'success');
    } catch (err) {
      const msg = err.message || 'Login failed. Please check credentials.';
      setError(msg);
      if (msg.includes('locked') || msg.includes('Too many failed')) {
        setIsLocked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={() => setShowLoginModal(false)}
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-[#2A170D] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border-t sm:border border-[#E8DFC8] dark:border-[#3A2012] pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0 bg-[#FAF6F0] dark:bg-[#1F1009]">
          <div className="w-12 h-1.5 rounded-full bg-[#D7CCC8] dark:bg-[#3A2012]" />
        </div>

        {/* Header */}
        <div className="bg-[#FAF6F0] dark:bg-[#1F1009] border-b border-[#E8DFC8] dark:border-[#3A2012] p-4 sm:p-5 relative">
          <button
            onClick={() => setShowLoginModal(false)}
            className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#A1887F] hover:text-[#2C1810] dark:hover:text-[#FAF4ED] hover:bg-[#EFEBE9] dark:hover:bg-[#2A170D] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-2xl bg-[#4E342E] dark:bg-[#D4AF37] text-white dark:text-[#120804] flex items-center justify-center mb-2 shadow-xs">
            <Lock className="w-5 h-5" />
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C1810] dark:text-[#FAF4ED]">
            Admin Security Login
          </h3>
          <p className="text-xs text-[#8D6E63] dark:text-[#A89080] mt-0.5">
            Ever Coffee House administrator & management access
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 bg-white dark:bg-[#2A170D]">
          {error && (
            <div className={`p-3 rounded-xl text-xs font-medium border flex items-start gap-2.5 ${
              isLocked 
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-900' 
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-900'
            }`}>
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                {error}
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                autoComplete="off"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full min-h-[44px] pl-10 pr-10 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1887F] hover:text-[#2C1810] dark:hover:text-[#FAF4ED]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isLocked}
            className="w-full min-h-[48px] py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#3E2723] dark:bg-[#D4AF37] dark:text-[#120804] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
}
