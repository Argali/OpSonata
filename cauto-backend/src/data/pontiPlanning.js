// In-memory per-tenant planning assignments
// Each assignment: { id, tenantId, orderId, ponte, date, startHour, duration }

let assignments = [];
let nextId = 1;

module.exports = {
  getByTenantAndDate(tenantId, date) {
    return assignments.filter(a => a.tenantId === tenantId && a.date === date);
  },

  add(data) {
    const entry = { id: `pa${nextId++}`, ...data };
    assignments.push(entry);
    return entry;
  },

  remove(id, tenantId) {
    const idx = assignments.findIndex(a => a.id === id && a.tenantId === tenantId);
    if (idx === -1) return false;
    assignments.splice(idx, 1);
    return true;
  },
};
