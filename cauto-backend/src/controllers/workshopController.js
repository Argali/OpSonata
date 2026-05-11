const workshopService  = require("../services/workshopService");
const { logAudit }     = require("../services/auditLogService");
const tenantRepo       = require("../repositories/tenantRepository");
const planningStore    = require("../data/pontiPlanning");

const workshopController = {
  getOrders(_req, res, next) {
    try { res.json({ ok: true, data: workshopService.getOrders() }); }
    catch (err) { next(err); }
  },

  getPonti(req, res, next) {
    try {
      const tenant = tenantRepo.findById(req.tenant.id);
      res.json({ ok: true, data: tenant?.ponti ?? [] });
    } catch (err) { next(err); }
  },

  updatePonti(req, res, next) {
    try {
      const { ponti } = req.body;
      if (!Array.isArray(ponti)) return res.status(400).json({ ok: false, error: "ponti deve essere un array" });
      const clean = ponti.map(p => String(p).trim()).filter(Boolean);
      const updated = tenantRepo.updatePonti(req.tenant.id, clean);
      if (!updated) return res.status(404).json({ ok: false, error: "Tenant non trovato" });
      res.json({ ok: true, data: updated.ponti });
    } catch (err) { next(err); }
  },

  getPlanning(req, res, next) {
    try {
      const { date } = req.query;
      if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date))
        return res.status(400).json({ ok: false, error: "Parametro date richiesto (YYYY-MM-DD)" });
      res.json({ ok: true, data: planningStore.getByTenantAndDate(req.tenant.id, date) });
    } catch (err) { next(err); }
  },

  addAssignment(req, res, next) {
    try {
      const { orderId, ponte, date, startHour, duration } = req.body;
      if (!orderId || !ponte || !date || startHour == null)
        return res.status(400).json({ ok: false, error: "Campi obbligatori: orderId, ponte, date, startHour" });
      const entry = planningStore.add({
        tenantId:  req.tenant.id,
        orderId,
        ponte,
        date,
        startHour: Number(startHour),
        duration:  Number(duration) || 2,
      });
      res.status(201).json({ ok: true, data: entry });
    } catch (err) { next(err); }
  },

  removeAssignment(req, res, next) {
    try {
      const removed = planningStore.remove(req.params.id, req.tenant.id);
      if (!removed) return res.status(404).json({ ok: false, error: "Assegnazione non trovata" });
      res.json({ ok: true });
    } catch (err) { next(err); }
  },

  updateOrder(req, res, next) {
    try {
      const before  = workshopService.getOrderById(req.params.id);
      const updated = workshopService.updateOrder(req.params.id, req.body);

      // Log each field that actually changed
      if (before) {
        for (const [field, newValue] of Object.entries(req.body)) {
          if (String(before[field] ?? "") !== String(newValue ?? "")) {
            logAudit(req, {
              module:       "workshop",
              entityTable:  "work_orders",
              entityId:     updated.id,
              entityLabel:  `Work Order — ${updated.vehicle || ""} (${updated.plate || ""})`,
              action:       "UPDATE",
              fieldChanged: field,
              oldValue:     before[field],
              newValue:     newValue,
            });
          }
        }
      }

      res.json({ ok: true, data: updated });
    } catch (err) { next(err); }
  },
};

module.exports = workshopController;
