import express from 'express';
import { db, isSupabase, supabase, getAuditLogs, logAudit } from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/logs
 * Retrieve system activity & security logs with filtering and pagination
 */
router.get('/', requireAuth, requireRole(['admin', 'manager']), async (req, res) => {
  const { action, search, limit = 50, page = 1 } = req.query;

  try {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(5, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    if (isSupabase) {
      let query = supabase.from('audit_logs').select('*', { count: 'exact' });

      if (action && action !== 'all') {
        query = query.ilike('action', `%${action}%`);
      }

      if (search && search.trim()) {
        const q = search.trim();
        query = query.or(`username.ilike.%${q}%,details.ilike.%${q}%,ip_address.ilike.%${q}%`);
      }

      query = query.order('id', { ascending: false }).range(offset, offset + limitNum - 1);

      const { data: logs, count, error } = await query;
      if (error) throw error;

      return res.json({
        logs: logs || [],
        pagination: {
          total: count || (logs || []).length,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil((count || 1) / limitNum)
        }
      });
    }

    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    let countSql = 'SELECT COUNT(*) as count FROM audit_logs WHERE 1=1';
    const params = [];
    const countParams = [];

    if (action && action !== 'all') {
      sql += ' AND action LIKE ?';
      countSql += ' AND action LIKE ?';
      params.push(`%${action}%`);
      countParams.push(`%${action}%`);
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      sql += ' AND (username LIKE ? OR details LIKE ? OR ip_address LIKE ?)';
      countSql += ' AND (username LIKE ? OR details LIKE ? OR ip_address LIKE ?)';
      params.push(q, q, q);
      countParams.push(q, q, q);
    }

    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const logs = db.prepare(sql).all(...params);
    const total = db.prepare(countSql).get(...countParams).count;

    res.json({
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to retrieve activity logs: ' + error.message });
  }
});

/**
 * DELETE /api/logs/prune
 * Prune audit logs older than 30 days. Admin only.
 */
router.delete('/prune', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    let prunedCount = 0;
    if (isSupabase) {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const { error } = await supabase.from('audit_logs').delete().lt('created_at', thirtyDaysAgo);
      if (error) throw error;
      prunedCount = 1;
    } else {
      const result = db.prepare(`
        DELETE FROM audit_logs 
        WHERE created_at < datetime('now', '-30 days')
      `).run();
      prunedCount = result.changes;
    }

    logAudit({
      userId: req.user.id,
      username: req.user.username,
      action: 'LOGS_PRUNED',
      details: `Pruned activity logs older than 30 days`,
      req
    });

    res.json({ message: `Pruned old log entries successfully` });
  } catch (error) {
    console.error('Error pruning audit logs:', error);
    res.status(500).json({ error: 'Failed to prune activity logs: ' + error.message });
  }
});

export default router;
