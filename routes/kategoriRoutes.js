import express from "express";
import {
  kategori,
  addKategori,
  updateKategori,
  deleteKategori,
} from "../controllers/kategoriController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Ini akan menjadi GET http://localhost:5000/api/kategori
router.get("/", auth, kategori);
router.post("/", auth, addKategori);
router.put("/:id", auth, updateKategori);
router.delete("/:id", auth, deleteKategori);

export default router;
