import express from "express";
import * as transaksiCtrl from "../controllers/transaksiController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();
export const allowedRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF];

// DEBUG: Tambahkan log ini untuk melihat apakah request masuk
router.use((req, res, next) => {
  //   console.log(`Request diterima: ${req.method} ${req.originalUrl}`);
  next();
});

router.get(
  "/",
  authenticateToken,
  authorizeRole(allowedRoles),
  transaksiCtrl.getRiwayatTransaksi,
);

router.post(
  "/",
  authenticateToken,
  authorizeRole(allowedRoles),
  transaksiCtrl.createTransaksi,
);

router.get(
  "/cari/:sn",
  authenticateToken,
  authorizeRole(allowedRoles),
  transaksiCtrl.cariBarangBySN,
);

// Ini akan menjadi POST http://localhost:5000/api/transaksi/recent
router.get(
  "/recent",
  authenticateToken,
  authorizeRole(allowedRoles),
  transaksiCtrl.getRecentTransaksi,
);

router.get(
  "/riwayat",
  authenticateToken,
  authorizeRole(allowedRoles),
  transaksiCtrl.getRiwayat,
);

export default router;
