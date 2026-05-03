import express from "express";
import { getLaporanHarian } from "../controllers/laporanController.js"; // Pastikan path benar
import { generateRekapHarian } from "../controllers/laporanController.js";
import { getDetailRetur } from "../controllers/laporanController.js";

const router = express.Router();

router.get("/stok-terkini", getLaporanHarian);
router.post("/generate-rekap", generateRekapHarian);
router.get("/detail-retur/:barangId", getDetailRetur);

export default router; // Ini adalah kunci agar bisa diimpor dengan 'import'
