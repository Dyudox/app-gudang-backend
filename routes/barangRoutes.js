import express from "express";
import * as barangCtrl from "../controllers/barangController.js";
// import { getGudangList } from "../controllers/barangController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { ROLES } from "../config/constants.js"; // JANGAN LUPA IMPORT INI

export const router = express.Router();

// Sekarang gunakan ROLES sesuai mapping di constants.js
// Contoh: Admin (1), Manager (2), User/Staff (3)
export const allowedRoles = [ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF];

// Ini akan menjadi GET http://localhost:5000/api/barang/gudang
router.get(
  "/gudang",
  authenticateToken,
  authorizeRole(allowedRoles),
  barangCtrl.getGudangList,
);

// Ini akan menjadi GET http://localhost:5000/api/barang/rak/by-gudang/1
router.get(
  "/rak/by-gudang/:gudang_id",
  authenticateToken,
  authorizeRole(allowedRoles),
  barangCtrl.getRakByGudang,
);

// Ini akan menjadi GET http://localhost:5000/api/barang/barcode/123
// router.get(
//   "/barcode/:barcode",
//   authenticateToken,
//   authorizeRole(allowedRoles),
//   barangCtrl.getBarangByBarcode,
// );

// // Ini akan menjadi POST http://localhost:5000/api/barang/transaksi
// router.post(
//   "/transaksi",
//   authenticateToken,
//   authorizeRole(allowedRoles),
//   barangCtrl.createTransaksi,
// );

// // Ini akan menjadi GET http://localhost:5000/api/barang/transaksi
// router.get(
//   "/transaksi/recent",
//   authenticateToken,
//   authorizeRole(allowedRoles),
//   barangCtrl.getRecentTransaksi,
// );

// Ini akan menjadi GET http://localhost:5000/api/barang
router.get(
  "/",
  authenticateToken,
  authorizeRole(allowedRoles),
  barangCtrl.getAllBarang,
);

// Ini akan menjadi GET http://localhost:5000/api/barang/groups
router.get(
  "/groups",
  authenticateToken,
  authorizeRole(allowedRoles),
  barangCtrl.getGroups,
);

// Ini akan menjadi POST http://localhost:5000/api/barang
router.post(
  "/",
  authenticateToken,
  authorizeRole(allowedRoles),
  barangCtrl.addBarang,
);

// Ini akan menjadi POST http://localhost:5000/api/barang/tambah-lokasi
router.post(
  "/tambah-lokasi",
  authenticateToken,
  authorizeRole(allowedRoles),
  barangCtrl.tambahLokasi,
);

// Ini akan menjadi PUT http://localhost:5000/api/barang/:id
router.put(
  "/:id",
  authenticateToken,
  authorizeRole(allowedRoles),
  barangCtrl.updateBarang,
);

// Ini akan menjadi DELETE http://localhost:5000/api/barang/:id
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole(allowedRoles),
  barangCtrl.deleteBarang,
);

// Ini akan menjadi GET http://localhost:5000/api/barang/:id
router.get(
  "/:id",
  authenticateToken,
  authorizeRole(allowedRoles),
  barangCtrl.getBarangById,
);

// Cukup satu saja yang ini untuk ambil detail
// router.get(
//   "/:id",
//   auth,
//   (req, res, next) => {
//     console.log("LOG: Request masuk ke Route Barang ID:", req.params.id);
//     next();
//   },
//   barangCtrl.getBarangById,
// );

export default router;
