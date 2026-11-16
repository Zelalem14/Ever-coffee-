import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function UserModal({ isOpen, onClose, onSave, userToEdit = null }) {
  const { addToast } = useToast();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('staff');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!userToEdit;

  useEffect(() => {
    if (userToEdit) {
      setUsername(userToEdit.username || '');
      setEmail(userToEdit.email || '');
      setName(userToEdit.name || '');
      setRole(userToEdit.role || 'staff');
      setIsActive(userToEdit.is_active === 1);
      setPassword('');
    } else {
      setUsername('');
      setEmail('');
      setName('');
      setRole('staff');
      setIsActive(true);
      setPassword('');
    }
    setError('');
    setShowPassword(false);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    if (!isEditing && (!password || password.length < 6)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (isEditing && password && password.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        username: username.trim().toLowerCase(),
        email: email.trim(),
        name: name.trim() || username.trim(),
        role,
        is_active: isActive ? 1 : 0
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      await onSave(payload, userToEdit?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save user account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#2A170D] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border-t sm:border border-[#E8DFC8] dark:border-[#3A2012] pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator Bar */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center shrink-0 bg-[#FAF6F0] dark:bg-[#1F1009]">
          <div className="w-12 h-1.5 rounded-full bg-[#D7CCC8] dark:bg-[#3A2012]" />
        </div>

        {/* Modal Header */}
        <div className="bg-[#FAF6F0] dark:bg-[#1F1009] border-b border-[#E8DFC8] dark:border-[#3A2012] p-4 sm:p-5 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#4E342E] dark:bg-[#D4AF37] text-white dark:text-[#120804] flex items-center justify-center shrink-0 shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C1810] dark:text-[#FAF4ED]">
                {isEditing ? `Edit User: ${userToEdit.username}` : 'Add New User'}
              </h3>
              <p className="text-xs text-[#8D6E63] dark:text-[#A89080]">
                Assign role and access permissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-[#A1887F] hover:text-[#2C1810] dark:hover:text-[#FAF4ED] hover:bg-[#EFEBE9] dark:hover:bg-[#2A170D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs font-medium border border-red-200 dark:border-red-900">
              {error}
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              Username *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                disabled={isEditing} // preserve username integrity on edit
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. barista_sam"
                className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
              />
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Samuel Bekele"
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="samuel@coffee.et"
                className="w-full min-h-[44px] pl-10 pr-3 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
              />
            </div>
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              Role & Permissions *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'admin', label: 'Admin', desc: 'Full system control' },
                { id: 'manager', label: 'Manager', desc: 'Menu & Settings' },
                { id: 'staff', label: 'Staff', desc: 'Stock availability' }
              ].map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    role === r.id
                      ? 'border-[#3E2723] dark:border-[#D4AF37] bg-[#FAF6F0] dark:bg-[#1F1009] ring-1 ring-[#3E2723] dark:ring-[#D4AF37]'
                      : 'border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#2A170D] opacity-75 hover:opacity-100'
                  }`}
                >
                  <p className="font-bold text-xs text-[#2C1810] dark:text-[#FAF4ED]">{r.label}</p>
                  <p className="text-[10px] text-[#8D6E63] dark:text-[#A89080] line-clamp-1">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5D4037] dark:text-[#D69E76] mb-1">
              {isEditing ? 'Change Password (Leave blank to keep current)' : 'Password *'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required={!isEditing}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? 'Enter new password...' : 'Minimum 6 characters'}
                className="w-full min-h-[44px] pl-10 pr-10 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1887F] hover:text-[#2C1810]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Active Status Switch */}
          {isEditing && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6F0] dark:bg-[#1F1009] border border-[#E8DFC8] dark:border-[#3A2012]">
              <div>
                <p className="text-xs font-bold text-[#2C1810] dark:text-[#FAF4ED]">Account Active Status</p>
                <p className="text-[11px] text-[#8D6E63] dark:text-[#A89080]">
                  {isActive ? 'Account is active and can log in' : 'Account is suspended'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive(a => !a)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? 'bg-emerald-600' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isActive ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E8DFC8] dark:border-[#3A2012]">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-semibold text-[#5D4037] dark:text-[#D69E76] hover:bg-[#EFEBE9] dark:hover:bg-[#1F1009] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="min-h-[44px] px-5 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#3E2723] dark:bg-[#D4AF37] dark:text-[#120804] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-95 transition-all shadow-xs disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
