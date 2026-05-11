const express                      = require("express");
const { requireAuth, requirePerm, requireAnyRole } = require("../middleware/auth");
const ctrl                         = require("../controllers/workshopController");

const router = express.Router();

router.get  ("/orders",     requireAuth, requirePerm("workshop", "view"), ctrl.getOrders);
router.patch("/orders/:id", requireAuth, requirePerm("workshop", "edit"), ctrl.updateOrder);
router.get  ("/ponti",      requireAuth, ctrl.getPonti);
router.put  ("/ponti",      requireAuth, requireAnyRole("fleet_manager", "company_admin"), ctrl.updatePonti);
router.get  ("/planning",   requireAuth, requirePerm("workshop", "view"), ctrl.getPlanning);
router.post ("/planning",   requireAuth, requirePerm("workshop", "edit"), ctrl.addAssignment);
router.delete("/planning/:id", requireAuth, requirePerm("workshop", "edit"), ctrl.removeAssignment);

module.exports = router;
