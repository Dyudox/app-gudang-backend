import express from "express";
import { getAllLokasi } from "../controllers/lokasiController.js";

const router = express.Router();
router.get("/", getAllLokasi);

export default router;
