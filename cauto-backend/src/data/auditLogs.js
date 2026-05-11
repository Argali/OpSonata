/**
 * Audit log store — persists to disk using the same jsonStore pattern
 * as planningEvents.js so logs survive Render restarts.
 *
 * Data directory resolves from PLANNING_DATA_DIR (already mounted at
 * /var/data on Render via render.yaml), so no new env var is needed.
 */

const { createStore } = require("./jsonStore");

// Separate file from planning data, same directory
const auditLogStore = createStore("auditLogs.json", []);

module.exports = auditLogStore;
