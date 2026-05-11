/**
 * Audit log repository — data access layer for audit entries.
 * Swap-ready for PostgreSQL: replace auditLogStore calls with
 * a DB client and nothing outside this file changes.
 */

const { randomUUID } = require("crypto");
const auditLogStore  = require("../data/auditLogs");

const auditLogRepository = {

  /**
   * Append a new audit entry.
   * Returns the saved record (with generated id).
   */
  append(entry) {
    const logs   = auditLogStore.read();
    const record = { id: randomUUID(), ...entry };
    auditLogStore.write([...logs, record]);
    return record;
  },

  /**
   * Query logs for a specific tenant, with optional filters.
   *
   * @param {string} clientId       - Required: scopes to one tenant
   * @param {object} opts
   * @param {string} [opts.module]   - Filter by module (e.g. 'workshop')
   * @param {string} [opts.entityId] - Filter by a specific record's ID
   * @param {string} [opts.action]   - Filter by action ('CREATE','UPDATE',...)
   * @param {number} [opts.limit]    - Max results (default 200)
   */
  findByClient(clientId, { module, entityId, action, limit = 200 } = {}) {
    const logs = auditLogStore.read();
    return logs
      .filter(l => l.clientId === clientId)
      .filter(l => !module   || l.module   === module)
      .filter(l => !entityId || l.entityId === entityId)
      .filter(l => !action   || l.action   === action)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  },
};

module.exports = auditLogRepository;
