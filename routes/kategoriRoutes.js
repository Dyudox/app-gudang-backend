import express from "express";
import {
  kategori,
  addKategori,
  updateKategori,
  deleteKategori,
} from "../controllers/kategoriController.js";
// import auth from "../middleware/auth.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

// Ini akan menjadi GET http://localhost:5000/api/kategori
router.get(
  "/",
  authenticateToken,
  authorizeRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]),
  kategori,
);
router.post(
  "/",
  authenticateToken,
  authorizeRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]),
  addKategori,
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]),
  updateKategori,
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]),
  deleteKategori,
);

export default router;
