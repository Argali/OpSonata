/**
 * Audit log service.
 *
 * Usage in any controller — call AFTER the main operation succeeds:
 *
 *   const { logAudit } = require("../services/auditLogService");
 *
 *   logAudit(req, {
 *     module:      "workshop",
 *     entityTable: "work_orders",
 *     entityId:    order.id,
 *     entityLabel: `Work Order #${order.id} — ${order.plate}`,
 *     action:      "UPDATE",
 *     fieldChanged:"status",
 *     oldValue:    "in_progress",
 *     newValue:    "done",
 *   });
 *
 * logAudit never throws — a logging failure must never break the main request.
 */

const auditLogRepository = require("../repositories/auditLogRepository");

/**
 * Log a single audit event.
 *
 * @param {import("express").Request} req  - Express request (user + IP source)
 * @param {object} entry
 * @param {string}  entry.module         - Logical module: 'workshop'|'permissions'|'users'|'planning'|...
 * @param {string}  entry.entityTable    - Store/table name: 'work_orders'|'users'|'permissions'|...
 * @param {string}  entry.entityId       - ID of the record that was touched
 * @param {string}  entry.entityLabel    - Human-readable label stored at write time (survives renames)
 * @param {string}  entry.action         - 'CREATE'|'UPDATE'|'DELETE'|'ASSIGN'|'APPROVE'|'EXPORT'
 * @param {string} [entry.fieldChanged]  - Which field changed (UPDATE only)
 * @param {string} [entry.oldValue]      - Previous value as string (UPDATE only)
 * @param {string} [entry.newValue]      - New value as string (UPDATE only)
 * @param {string} [entry.notes]         - Optional free-text context
 */
function logAudit(req, entry) {
  try {
    auditLogRepository.append({
      timestamp:   new Date().toISOString(),
      // WHO — from the JWT payload attached by requireAuth
      userId:      req.user?.id       || null,
      userEmail:   req.user?.email    || null,
      userRole:    req.user?.role     || null,
      clientId:    req.tenant?.id     || req.user?.tenant_id || null,
      ipAddress:   req.headers["x-forwarded-for"]?.split(",")[0].trim()
                   || req.socket?.remoteAddress
                   || null,
      // WHAT
      ...entry,
      // Coerce old/new values to strings so they're always readable in the UI
      oldValue:    entry.oldValue != null ? String(entry.oldValue) : null,
      newValue:    entry.newValue != null ? String(entry.newValue) : null,
    });
  } catch (err) {
    // Intentionally swallowed — audit failure must never break the main flow
    console.error("[AuditLog] Failed to write entry:", err.message);
  }
}

/**
 * Retrieve audit logs for the calling user's tenant.
 *
 * @param {string} clientId
 * @param {object} [filters]  - module, entityId, action, limit
 */
function getAuditLogs(clientId, filters = {}) {
  return auditLogRepository.findByClient(clientId, filters);
}

module.exports = { logAudit, getAuditLogs };
