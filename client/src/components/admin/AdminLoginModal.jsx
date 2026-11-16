import React, { useState } from 'react';
import { X, Lock, User, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLoginModal() {
  const { showLoginModal, setShowLoginModal, login } = useAuth();
  const { addToast } = useToast();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!showLoginModal) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      addToast('Welcome to Coffee House Admin!', 'success');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = () => {
    setUsername('admin');
    setPassword('admin123');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={() => setShowLoginModal(false)}
    >
      <div
        className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border-t sm:border border-[#E8DFC8] pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0 bg-[#FAF6F0]">
          <div className="w-12 h-1.5 rounded-full bg-[#D7CCC8]" />
        </div>

        {/* Header */}
        <div className="bg-[#FAF6F0] border-b border-[#E8DFC8] p-4 sm:p-5 relative">
          <button
            onClick={() => setShowLoginModal(false)}
            className="absolute top-3 right-3 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-[#A1887F] hover:text-[#2C1810] hover:bg-[#EFEBE9] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-xl bg-[#4E342E] text-white flex items-center justify-center mb-2 shadow-xs">
            <Lock className="w-5 h-5 text-[#FFE082]" />
          </div>

          <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C1810]">
            Admin Dashboard Login
          </h3>
          <p className="text-xs text-[#8D6E63] mt-0.5">
            Manage drinks, snacks, prices, and branding
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 bg-white">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-medium border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-xl border border-[#D7CCC8] text-base sm:text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] mb-1">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-xl border border-[#D7CCC8] text-base sm:text-sm text-[#2C1810] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
              />
            </div>
          </div>

          {/* Demo shortcut with touch target */}
          <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#E8DFC8] flex items-center justify-between text-xs text-[#5D4037]">
            <span className="font-mono text-xs text-[#8D6E63]">admin / admin123</span>
            <button
              type="button"
              onClick={autofillDemo}
              className="min-h-[36px] px-3 py-1 rounded-lg bg-white border border-[#D7CCC8] hover:bg-[#EFEBE9] active:scale-95 text-[#3E2723] text-xs font-semibold shadow-2xs"
            >
              Fill Demo
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[48px] py-3 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#3E2723] hover:bg-[#2C1810] active:scale-[0.98] transition-all disabled:opacity-50 shadow-xs"
          >
            {loading ? 'Logging in...' : 'Sign In to Dashboard'}
          </button>
        </form>

      </div>
    </div>
  );
}
