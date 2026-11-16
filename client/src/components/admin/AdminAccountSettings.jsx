import React, { useState } from 'react';
import { 
  Key, 
  User, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Save, 
  Mail,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminAccountSettings() {
  const { user, changeCredentials, updateProfile } = useAuth();
  const { addToast } = useToast();

  // Credentials State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [credLoading, setCredLoading] = useState(false);
  const [credError, setCredError] = useState('');
  const [credSuccess, setCredSuccess] = useState('');

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setCredError('');
    setCredSuccess('');

    if (!currentPassword) {
      setCredError('Please enter your current password to authorize changes.');
      return;
    }

    if (!newUsername.trim() && !newPassword) {
      setCredError('Please enter a new username or new password to update.');
      return;
    }

    if (newUsername.trim() && newUsername.trim().length < 3) {
      setCredError('New username must be at least 3 characters long.');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setCredError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setCredError('New password and confirmation password do not match.');
        return;
      }
    }

    try {
      setCredLoading(true);
      const res = await changeCredentials({
        currentPassword,
        newUsername: newUsername.trim() || undefined,
        newPassword: newPassword || undefined,
        confirmPassword: confirmPassword || undefined
      });

      const msg = res.message || 'Credentials updated successfully!';
      setCredSuccess(msg);
      addToast(msg, 'success');

      // Clear sensitive fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNewUsername('');
    } catch (err) {
      const msg = err.message || 'Failed to update credentials. Please check your current password.';
      setCredError(msg);
      addToast(msg, 'error');
    } finally {
      setCredLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSuccess('');

    try {
      setProfileLoading(true);
      const res = await updateProfile({
        name: name.trim(),
        email: email.trim()
      });

      const msg = res.message || 'Profile details updated!';
      setProfileSuccess(msg);
      addToast(msg, 'success');
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* 1. Account Summary Card */}
      <div className="bg-white dark:bg-[#1F1009] rounded-2xl border border-[#E8DFC8] dark:border-[#3A2012] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#4E342E] to-[#2C1810] dark:from-[#D4AF37] dark:to-[#8D6E63] text-white dark:text-[#120804] flex items-center justify-center font-serif text-xl font-black shadow-md shrink-0">
            {(user?.username || 'A').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif text-lg font-bold text-[#2C1810] dark:text-[#FAF4ED]">
                {user?.name || user?.username || 'Administrator'}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {user?.role || 'admin'}
              </span>
            </div>
            <p className="text-xs text-[#8D6E63] dark:text-[#A89080] mt-0.5 font-mono">
              @{user?.username} {user?.email ? `• ${user?.email}` : ''}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs text-[#8D6E63] dark:text-[#A89080] shrink-0">
          <div className="flex items-center sm:justify-end gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Active Session</span>
          </div>
          <p className="text-[11px] mt-0.5">
            Expires after 30 min of inactivity
          </p>
        </div>
      </div>

      {/* 2. Change Username and Password Form */}
      <div className="bg-white dark:bg-[#1F1009] rounded-2xl border border-[#E8DFC8] dark:border-[#3A2012] p-5 sm:p-7 shadow-xs space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Key className="w-5 h-5 text-[#3E2723] dark:text-[#D4AF37]" />
            <h3 className="font-serif text-lg font-bold text-[#2C1810] dark:text-[#FAF4ED]">
              Change Admin Username & Password
            </h3>
          </div>
          <p className="text-xs text-[#8D6E63] dark:text-[#A89080]">
            Update your login credentials. You will need your current password to verify your identity.
          </p>
        </div>

        {credSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-medium flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {credSuccess}
            </div>
          </div>
        )}

        {credError && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800 text-xs font-medium flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              {credError}
            </div>
          </div>
        )}

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          
          {/* Current Username Info */}
          <div className="p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] flex items-center justify-between text-xs">
            <span className="text-[#5D4037] dark:text-[#D69E76] font-semibold">Current Username:</span>
            <span className="font-mono font-bold text-[#2C1810] dark:text-[#FAF4ED]">@{user?.username}</span>
          </div>

          {/* New Username (Optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              New Username (Optional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                autoComplete="off"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Leave blank to keep current username"
                className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#120804] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
              />
            </div>
          </div>

          {/* New Password & Confirm New Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                New Password (Optional)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showNewPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#120804] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1887F] hover:text-[#2C1810] dark:hover:text-[#FAF4ED]"
                  aria-label="Toggle new password visibility"
                >
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#120804] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1887F] hover:text-[#2C1810] dark:hover:text-[#FAF4ED]"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Current Password (Mandatory) */}
          <div className="pt-2 border-t border-[#E8DFC8] dark:border-[#3A2012]">
            <label className="block text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-400 mb-1">
              Current Password (Required to verify authorization) *
            </label>
            <div className="relative">
              <Fingerprint className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showCurrentPw ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-white dark:bg-[#120804] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-rose-500/30"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1887F] hover:text-[#2C1810] dark:hover:text-[#FAF4ED]"
                aria-label="Toggle current password visibility"
              >
                {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={credLoading}
            className="w-full sm:w-auto min-h-[46px] px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#3E2723] dark:bg-[#D4AF37] dark:text-[#120804] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-95 transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{credLoading ? 'Verifying & Updating...' : 'Update Admin Credentials'}</span>
          </button>
        </form>
      </div>

      {/* 3. Display Profile Settings */}
      <div className="bg-white dark:bg-[#1F1009] rounded-2xl border border-[#E8DFC8] dark:border-[#3A2012] p-5 sm:p-7 shadow-xs space-y-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#2C1810] dark:text-[#FAF4ED]">
            Administrator Profile Info
          </h3>
          <p className="text-xs text-[#8D6E63] dark:text-[#A89080]">
            Update your display name and contact email for receipt of important audit notifications.
          </p>
        </div>

        {profileSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Zelalem B."
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#120804] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@coffeehouse.et"
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#120804] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={profileLoading}
            className="min-h-[44px] px-5 py-2 rounded-xl font-bold text-xs sm:text-sm text-[#3E2723] dark:text-[#FAF4ED] bg-[#FAF6F0] dark:bg-[#2A170D] border border-[#D7CCC8] dark:border-[#3A2012] hover:bg-[#EFEBE9] dark:hover:bg-[#3A2012] active:scale-95 transition-all flex items-center gap-2"
          >
            <span>{profileLoading ? 'Saving...' : 'Save Profile Details'}</span>
          </button>
        </form>
      </div>

      {/* 4. Security Architecture Summary */}
      <div className="bg-[#FAF6F0] dark:bg-[#1A0E08] rounded-2xl border border-[#E8DFC8] dark:border-[#3A2012] p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <h4 className="font-serif font-bold text-sm text-[#2C1810] dark:text-[#FAF4ED]">
            System Security Protections
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#5D4037] dark:text-[#A89080]">
          <div className="p-3 rounded-xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8]/60 dark:border-[#3A2012]">
            <p className="font-bold text-[#2C1810] dark:text-[#FAF4ED]">🔒 Bcrypt Password Hashing</p>
            <p className="text-[11px] mt-0.5">Passwords are cryptographically salted and hashed. Never stored as plain text.</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8]/60 dark:border-[#3A2012]">
            <p className="font-bold text-[#2C1810] dark:text-[#FAF4ED]">🛡️ Rate-Limiting & Lockout</p>
            <p className="text-[11px] mt-0.5">5 failed consecutive attempts trigger a 15-minute temporary lockout to stop brute force.</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8]/60 dark:border-[#3A2012]">
            <p className="font-bold text-[#2C1810] dark:text-[#FAF4ED]">⏱️ Inactivity Auto-Expiry</p>
            <p className="text-[11px] mt-0.5">Sessions automatically expire after 30 minutes of idle time for kiosk & mobile security.</p>
          </div>
          <div className="p-3 rounded-xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8]/60 dark:border-[#3A2012]">
            <p className="font-bold text-[#2C1810] dark:text-[#FAF4ED]">📜 Live Security Audit Trail</p>
            <p className="text-[11px] mt-0.5">All administrative logins, updates, and deletes are recorded with actor and timestamp.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
