import express from "express";
import * as authCtrl from "../controllers/authController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { ROLES } from "../config/constants.js"; // IMPORT INI WAJIB ADA

const router = express.Router();

// --- Public Routes (Bisa diakses tanpa login) ---
router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.post("/logout", authCtrl.logout);

// --- Protected Routes ---
// Gunakan ROLES.ADMIN agar konsisten
router.get(
  "/users",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  authCtrl.getUsers,
);

router.get(
  "/users/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  authCtrl.getUserById,
);

router.put(
  "/users/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN]),
  authCtrl.updateUser,
);

// Admin dan Manager bisa menghapus user
router.delete(
  "/users/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN, ROLES.MANAGER]),
  authCtrl.deleteUser,
);

export default router;
