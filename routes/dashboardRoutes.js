import express from "express";
import * as dashCtrl from "../controllers/dashboardController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { ROLES } from "../config/constants.js"; // JANGAN LUPA IMPORT INI
// import authenticateToken from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/stats",
  authenticateToken,
  authorizeRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]),
  dashCtrl.getStats,
);
router.get(
  "/charts",
  authenticateToken,
  authorizeRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]),
  dashCtrl.getCharts,
);
// router.get("/dashboard/charts", authenticateToken, dashCtrl.getChartData);

// INI YANG HILANG:
export default router;
