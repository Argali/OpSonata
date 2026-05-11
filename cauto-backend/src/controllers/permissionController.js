const permissionService = require("../services/permissionService");
const { logAudit }      = require("../services/auditLogService");

const permissionController = {
  get(req, res, next) {
    try { res.json({ ok: true, ...permissionService.getMatrix(req.user.role) }); }
    catch (err) { next(err); }
  },

  patch(req, res, next) {
    try {
      permissionService.setMatrix(req.body.matrix);

      logAudit(req, {
        module:      "permissions",
        entityTable: "permissions",
        entityId:    req.tenant?.id || req.user?.tenant_id || "global",
        entityLabel: "Permission Matrix",
        action:      "UPDATE",
        notes:       "Full matrix replaced via Admin Panel",
      });

      res.json({ ok: true, ...permissionService.getMatrix(req.user.role) });
    } catch (err) { next(err); }
  },
};

module.exports = permissionController;
