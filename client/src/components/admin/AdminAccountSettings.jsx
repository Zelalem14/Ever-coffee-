import React, { useState } from 'react';
import { 
  KeyRound, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Save, 
  LogOut,
  Fingerprint,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminAccountSettings() {
  const { user, changeCredentials, logout } = useAuth();
  const { addToast } = useToast();

  // Credentials form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Current password is required to confirm identity.');
      return;
    }

    if (!newUsername.trim() && !newPassword) {
      setError('Please provide a new username or a new password.');
      return;
    }

    if (newUsername.trim() && newUsername.trim().length < 3) {
      setError('New username must be at least 3 characters.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('New password and confirmation password do not match.');
        return;
      }
    }

    try {
      setLoading(true);
      const res = await changeCredentials({
        currentPassword,
        newUsername: newUsername.trim() || undefined,
        newPassword: newPassword || undefined,
        confirmPassword: confirmPassword || undefined
      });

      const msg = res.message || 'Credentials updated successfully!';
      setSuccess(msg);
      addToast(msg, 'success');

      // Clear sensitive form fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNewUsername('');
    } catch (err) {
      const msg = err.message || 'Failed to update credentials. Please check your current password.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Account Info Header Card */}
      <div className="bg-white dark:bg-[#1F1009] rounded-2xl border border-zinc-200 dark:border-[#3A2012] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4E342E] to-[#2C1810] dark:from-[#D4AF37] dark:to-[#8D6E63] text-white dark:text-[#120804] flex items-center justify-center font-serif text-lg font-bold shadow-xs shrink-0">
            {(user?.username || 'A').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-base sm:text-lg font-bold text-zinc-900 dark:text-[#FAF4ED]">
                Administrator Account
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-[#A89080] font-mono mt-0.5">
              Current Username: <strong className="text-zinc-900 dark:text-[#FAF4ED]">@{user?.username}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 active:scale-95 transition-all self-stretch sm:self-auto justify-center"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>

      {/* Change Credentials Form Card */}
      <div className="bg-white dark:bg-[#1F1009] rounded-2xl border border-zinc-200 dark:border-[#3A2012] p-5 sm:p-7 shadow-xs space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <KeyRound className="w-5 h-5 text-[#3E2723] dark:text-[#D4AF37]" />
            <h3 className="font-serif text-lg font-bold text-zinc-900 dark:text-[#FAF4ED]">
              Change Username & Password
            </h3>
          </div>
          <p className="text-xs text-zinc-500 dark:text-[#A89080]">
            Update your administrator login credentials. Your current password is required for security.
          </p>
        </div>

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-medium flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{success}</div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 text-xs font-medium flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* New Username Field (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-[#D69E76] mb-1">
              New Username (Optional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoComplete="off"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Leave blank to keep current username"
                className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-[#3A2012] bg-white dark:bg-[#120804] text-base sm:text-sm text-zinc-900 dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
              />
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-[#A89080] mt-1">
              Minimum 3 characters (letters, numbers, underscores).
            </p>
          </div>

          {/* New Password & Confirmation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-[#D69E76] mb-1">
                New Password (Optional)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-[#3A2012] bg-white dark:bg-[#120804] text-base sm:text-sm text-zinc-900 dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-[#FAF4ED]"
                  aria-label="Toggle new password visibility"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-700 dark:text-[#D69E76] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl border border-zinc-200 dark:border-[#3A2012] bg-white dark:bg-[#120804] text-base sm:text-sm text-zinc-900 dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-[#FAF4ED]"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Current Password Field (Required for security) */}
          <div className="pt-3 border-t border-zinc-200 dark:border-[#3A2012]">
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 mb-1">
              Current Password (Required to verify authorization) *
            </label>
            <div className="relative">
              <Fingerprint className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showCurrentPw ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-[#120804] text-base sm:text-sm text-zinc-900 dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900 dark:hover:text-[#FAF4ED]"
                aria-label="Toggle current password visibility"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white dark:text-[#120804] bg-[#3E2723] dark:bg-[#D4AF37] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Update Admin Credentials'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* Security Architecture Summary */}
      <div className="bg-zinc-50 dark:bg-[#1A0E08] rounded-2xl border border-zinc-200 dark:border-[#3A2012] p-4 sm:p-5 flex items-start gap-3 text-xs text-zinc-700 dark:text-[#A89080]">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-zinc-900 dark:text-[#FAF4ED]">
            Cryptographic Security Protection
          </p>
          <p className="text-[11px] leading-relaxed">
            All passwords are cryptographically salted and hashed using bcrypt before being saved to the database. Plain text passwords are never stored or exposed anywhere in the system.
          </p>
        </div>
      </div>

    </div>
  );
}
