import React, { useState, useEffect } from 'react';
import { Plus, User, Shield, Key, Trash2, Edit3, CheckCircle2, XCircle, Search, RefreshCw } from 'lucide-react';
import { api } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import UserModal from './UserModal';

export default function AdminUsersTable() {
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data || []);
    } catch (err) {
      addToast(err.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (payload, userId) => {
    try {
      if (userId) {
        await api.updateUser(userId, payload);
        addToast('User updated successfully', 'success');
      } else {
        await api.createUser(payload);
        addToast('User created successfully', 'success');
      }
      fetchUsers();
    } catch (err) {
      addToast(err.message || 'Failed to save user', 'error');
      throw err;
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    try {
      await api.deleteUser(userToDelete.id);
      addToast(`User "${userToDelete.username}" deleted`, 'success');
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (err) {
      addToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const handleToggleStatus = async (userToToggle) => {
    try {
      const newStatus = userToToggle.is_active === 1 ? 0 : 1;
      await api.updateUser(userToToggle.id, { is_active: newStatus });
      addToast(`User ${newStatus ? 'activated' : 'suspended'}`, 'success');
      fetchUsers();
    } catch (err) {
      addToast(err.message || 'Failed to update user status', 'error');
    }
  };

  const filteredUsers = users.filter(u => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      (u.username || '').toLowerCase().includes(q) ||
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] shadow-xs">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C1810] dark:text-[#FAF4ED] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#4E342E] dark:text-[#D4AF37]" />
            <span>Administrator & Staff Accounts</span>
          </h3>
          <p className="text-xs text-[#8D6E63] dark:text-[#A89080]">
            Manage login credentials, assign security roles, and monitor account access
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            title="Refresh Users"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-[#795548] dark:text-[#D69E76] hover:bg-[#FAF6F0] active:scale-95 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setSelectedUser(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-1.5 min-h-[40px] px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-[#3E2723] dark:bg-[#D4AF37] dark:text-[#120804] hover:bg-[#2C1810] dark:hover:bg-[#E9C053] active:scale-95 transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by username, name, email or role..."
          className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#2A170D] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
        />
      </div>

      {/* Mobile Card View (sm:hidden) */}
      <div className="sm:hidden space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#2A170D] rounded-2xl border border-[#E8DFC8] dark:border-[#3A2012] text-xs text-[#8D6E63]">
            No user accounts found matching your search.
          </div>
        ) : (
          filteredUsers.map((u) => (
            <div
              key={u.id}
              className="p-4 rounded-2xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] shadow-xs space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FAF6F0] dark:bg-[#1F1009] border border-[#E8DFC8] dark:border-[#3A2012] flex items-center justify-center font-bold text-xs text-[#3E2723] dark:text-[#D4AF37]">
                    {u.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#2C1810] dark:text-[#FAF4ED]">
                      {u.name || u.username}
                    </h4>
                    <p className="text-xs text-[#8D6E63] dark:text-[#A89080]">@{u.username}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    u.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                      : u.role === 'manager'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                  }`}
                >
                  {u.role}
                </span>
              </div>

              {u.email && (
                <p className="text-xs text-[#795548] dark:text-[#D69E76] truncate">
                  ✉️ {u.email}
                </p>
              )}

              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8DFC8]/60 dark:border-[#3A2012]">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-[11px] text-[#8D6E63] dark:text-[#A89080]">
                    {u.is_active ? 'Active' : 'Suspended'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedUser(u);
                      setModalOpen(true);
                    }}
                    className="min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FAF6F0] dark:bg-[#1F1009] text-[#5D4037] dark:text-[#D69E76] border border-[#D7CCC8] dark:border-[#3A2012] hover:bg-[#EFEBE9]"
                  >
                    Edit
                  </button>

                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => setDeleteConfirmUser(u)}
                      className="min-h-[36px] px-2 py-1 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (hidden sm:block) */}
      <div className="hidden sm:block rounded-2xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#FAF6F0] dark:bg-[#1F1009] border-b border-[#E8DFC8] dark:border-[#3A2012] text-[#8D6E63] dark:text-[#A89080] uppercase tracking-wider font-semibold">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Login</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8DFC8]/60 dark:divide-[#3A2012]">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#8D6E63]">
                  No user accounts found matching your search.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF6F0]/50 dark:hover:bg-[#1F1009]/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF6F0] dark:bg-[#1F1009] border border-[#E8DFC8] dark:border-[#3A2012] flex items-center justify-center font-bold text-xs text-[#3E2723] dark:text-[#D4AF37]">
                        {u.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[#2C1810] dark:text-[#FAF4ED] text-sm">
                          {u.name || u.username}
                        </p>
                        <p className="text-[11px] text-[#8D6E63] dark:text-[#A89080]">
                          @{u.username} {u.email ? `· ${u.email}` : ''}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                          : u.role === 'manager'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      disabled={u.id === currentUser?.id}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                        u.is_active
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                      } ${u.id === currentUser?.id ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:opacity-80'}`}
                      title={u.id === currentUser?.id ? 'Cannot deactivate your own account' : 'Click to toggle status'}
                    >
                      {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{u.is_active ? 'Active' : 'Suspended'}</span>
                    </button>
                  </td>

                  <td className="px-4 py-3 text-[11px] text-[#8D6E63] dark:text-[#A89080]">
                    {u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setModalOpen(true);
                        }}
                        className="min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#FAF6F0] dark:bg-[#1F1009] text-[#5D4037] dark:text-[#D69E76] border border-[#D7CCC8] dark:border-[#3A2012] hover:bg-[#EFEBE9] transition-colors"
                      >
                        Edit
                      </button>

                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => setDeleteConfirmUser(u)}
                          className="min-h-[32px] px-2 py-1 rounded-lg text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveUser}
        userToEdit={selectedUser}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setDeleteConfirmUser(null)}
        >
          <div 
            className="w-full max-w-sm p-5 rounded-2xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-base font-bold text-[#2C1810] dark:text-[#FAF4ED]">
                  Delete User Account?
                </h4>
                <p className="text-xs text-[#8D6E63] dark:text-[#A89080]">
                  Are you sure you want to remove @{deleteConfirmUser.username}?
                </p>
              </div>
            </div>

            <p className="text-xs text-[#5D4037] dark:text-[#D69E76] leading-relaxed bg-[#FAF6F0] dark:bg-[#1F1009] p-3 rounded-xl border border-[#E8DFC8] dark:border-[#3A2012]">
              This action cannot be undone. All access for this user will be revoked immediately.
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="min-h-[40px] px-4 rounded-xl text-xs font-semibold text-[#5D4037] dark:text-[#D69E76] hover:bg-[#EFEBE9]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(deleteConfirmUser)}
                className="min-h-[40px] px-4 rounded-xl font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 active:scale-95 transition-all shadow-xs"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
