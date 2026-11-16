import React, { useState, useEffect } from 'react';
import { Activity, Search, RefreshCw, Shield, Trash2, Filter } from 'lucide-react';
import { api } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminLogsTable() {
  const { isAdmin } = useAuth();
  const { addToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [page, setPage] = useState(1);

  const fetchLogs = async (targetPage = 1, currentSearch = search, currentFilter = filterAction) => {
    try {
      setLoading(true);
      const params = {
        page: targetPage,
        limit: 25,
        search: currentSearch.trim(),
        action: currentFilter === 'all' ? '' : currentFilter
      };
      const res = await api.getAuditLogs(params);
      setLogs(res.logs || []);
      setTotal(res.pagination?.total || 0);
      setPage(targetPage);
    } catch (err) {
      addToast(err.message || 'Failed to fetch activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1, search, filterAction);
  }, [filterAction]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1, search, filterAction);
  };

  const handlePruneLogs = async () => {
    if (!window.confirm('Are you sure you want to prune activity logs older than 30 days?')) return;
    try {
      const res = await api.pruneAuditLogs();
      addToast(res.message || 'Logs pruned successfully', 'success');
      fetchLogs(1);
    } catch (err) {
      addToast(err.message || 'Failed to prune logs', 'error');
    }
  };

  const getActionBadge = (action) => {
    if (action.includes('LOGIN_SUCCESS')) {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
    }
    if (action.includes('LOGIN_FAILED') || action.includes('LOCKOUT')) {
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900';
    }
    if (action.includes('PRODUCT')) {
      return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900';
    }
    if (action.includes('USER')) {
      return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900';
    }
    if (action.includes('CATEGORY')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900';
    }
    return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] shadow-xs">
        <div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C1810] dark:text-[#FAF4ED] flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>System Activity & Audit Logs</span>
          </h3>
          <p className="text-xs text-[#8D6E63] dark:text-[#A89080]">
            Track all security events, logins, menu updates, and user modifications with IP tracking
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs(page)}
            title="Refresh logs"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] text-[#795548] dark:text-[#D69E76] hover:bg-[#FAF6F0] active:scale-95 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {isAdmin && (
            <button
              onClick={handlePruneLogs}
              title="Prune logs older than 30 days"
              className="flex items-center gap-1.5 min-h-[40px] px-3.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 active:scale-95 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Prune Old Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-[#A1887F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, IP address, or details..."
            className="w-full min-h-[44px] pl-10 pr-4 py-2 rounded-xl border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#2A170D] text-base sm:text-sm text-[#2C1810] dark:text-[#FAF4ED] focus:outline-none focus:ring-2 focus:ring-[#8D6E63]/30"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All' },
            { id: 'LOGIN', label: 'Logins' },
            { id: 'PRODUCT', label: 'Items' },
            { id: 'USER', label: 'Users' },
            { id: 'SETTINGS', label: 'Settings' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterAction(f.id)}
              className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterAction === f.id
                  ? 'bg-[#3E2723] dark:bg-[#D4AF37] text-white dark:text-[#120804] shadow-xs'
                  : 'bg-white dark:bg-[#2A170D] text-[#795548] dark:text-[#D69E76] border border-[#E8DFC8] dark:border-[#3A2012] hover:bg-[#FAF6F0]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Card List (sm:hidden) */}
      <div className="sm:hidden space-y-2.5">
        {logs.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#2A170D] rounded-2xl border border-[#E8DFC8] dark:border-[#3A2012] text-xs text-[#8D6E63]">
            No audit logs found.
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-2xl bg-white dark:bg-[#2A170D] border border-[#E8DFC8] dark:border-[#3A2012] shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getActionBadge(log.action)}`}>
                  {log.action}
                </span>
                <span className="text-[11px] text-[#8D6E63] dark:text-[#A89080]">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs font-medium text-[#2C1810] dark:text-[#FAF4ED] leading-relaxed">
                {log.details}
              </p>

              <div className="flex items-center justify-between text-[11px] text-[#8D6E63] dark:text-[#A89080] pt-1 border-t border-[#E8DFC8]/60 dark:border-[#3A2012]">
                <span>By: <strong>{log.username || 'system'}</strong></span>
                <span className="font-mono text-[10px]">{log.ip_address}</span>
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
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">Details</th>
              <th className="px-4 py-3 text-right">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8DFC8]/60 dark:divide-[#3A2012]">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-[#8D6E63]">
                  No activity logs found.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF6F0]/50 dark:hover:bg-[#1F1009]/40 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-[#8D6E63] dark:text-[#A89080] text-[11px]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-bold text-[#2C1810] dark:text-[#FAF4ED]">
                    {log.username || 'system'}
                  </td>

                  <td className="px-4 py-3 text-[#5D4037] dark:text-[#D69E76] max-w-md truncate" title={log.details}>
                    {log.details}
                  </td>

                  <td className="px-4 py-3 text-right font-mono text-[11px] text-[#8D6E63] dark:text-[#A89080]">
                    {log.ip_address}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between text-xs text-[#8D6E63] dark:text-[#A89080] p-2">
        <span>Showing {logs.length} of {total} total logs</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchLogs(page - 1)}
            disabled={page <= 1}
            className="min-h-[36px] px-3 rounded-lg border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] disabled:opacity-40"
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            onClick={() => fetchLogs(page + 1)}
            disabled={logs.length < 25}
            className="min-h-[36px] px-3 rounded-lg border border-[#D7CCC8] dark:border-[#3A2012] bg-white dark:bg-[#1F1009] disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
