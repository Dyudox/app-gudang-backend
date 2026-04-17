import express from "express";
import * as barangCtrl from "../controllers/barangController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/barcode/:barcode", auth, barangCtrl.getBarangByBarcode);
router.post("/transaksi", auth, barangCtrl.createTransaksi);
router.get("/transaksi/recent", auth, barangCtrl.getRecentTransaksi);

router.get("/", auth, barangCtrl.getAllBarang);
router.get("/groups", auth, barangCtrl.getGroups);
router.post("/", auth, barangCtrl.addBarang);
router.put("/:id", auth, barangCtrl.updateBarang);
router.delete("/:id", auth, barangCtrl.deleteBarang);
router.get("/:id", auth, barangCtrl.getBarangById);

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
