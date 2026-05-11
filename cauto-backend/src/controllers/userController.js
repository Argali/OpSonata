const userService  = require("../services/userService");
const { logAudit } = require("../services/auditLogService");

const userController = {
  list(req, res, next) {
    try { res.json({ ok: true, data: userService.listUsers(req.user.role, req.tenant.id) }); }
    catch (err) { next(err); }
  },

  create(req, res, next) {
    try {
      const user = userService.createUser(req.body, req.user);

      logAudit(req, {
        module:      "users",
        entityTable: "users",
        entityId:    user.id,
        entityLabel: `User — ${user.email}`,
        action:      "CREATE",
      });

      res.status(201).json({ ok: true, data: user });
    } catch (err) { next(err); }
  },

  update(req, res, next) {
    try {
      const user = userService.updateUser(req.params.id, req.body, req.user);

      logAudit(req, {
        module:      "users",
        entityTable: "users",
        entityId:    user.id,
        entityLabel: `User — ${user.email}`,
        action:      "UPDATE",
        notes:       `Fields updated: ${Object.keys(req.body).join(", ")}`,
      });

      res.json({ ok: true, data: user });
    } catch (err) { next(err); }
  },

  deactivate(req, res, next) {
    try {
      userService.deactivateUser(req.params.id, req.user);

      logAudit(req, {
        module:      "users",
        entityTable: "users",
        entityId:    req.params.id,
        entityLabel: `User ID ${req.params.id}`,
        action:      "DELETE",
        notes:       "User deactivated (soft delete)",
      });

      res.json({ ok: true });
    } catch (err) { next(err); }
  },
};

module.exports = userController;
