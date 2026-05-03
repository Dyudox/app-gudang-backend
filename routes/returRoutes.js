import express from "express";
import { prosesRetur } from "../controllers/returBarangController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

router.post(
  "/",
  authenticateToken,
  authorizeRole([ROLES.ADMIN, ROLES.MANAGER]),
  prosesRetur,
);

export default router;
