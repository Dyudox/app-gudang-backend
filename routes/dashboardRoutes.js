import express from "express";
const router = express.Router();
import * as dashCtrl from "../controllers/dashboardController.js";
import authenticateToken from "../middleware/auth.js";

router.get("/stats", authenticateToken, dashCtrl.getStats);
router.get("/charts", authenticateToken, dashCtrl.getCharts);

// INI YANG HILANG:
export default router;
