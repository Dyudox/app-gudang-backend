import express from "express";
import * as authCtrl from "../controllers/authController.js";
import authenticateToken from "../middleware/auth.js";

const router = express.Router();

// --- Public Routes (Bisa diakses tanpa login) ---
router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.post("/logout", authCtrl.logout);

// --- Protected Routes (Wajib login/bawa token) ---
router.get("/users", authenticateToken, authCtrl.getUsers);
router.get("/users/:id", authenticateToken, authCtrl.getUserById);
router.put("/users/:id", authenticateToken, authCtrl.updateUser);
router.delete("/users/:id", authenticateToken, authCtrl.deleteUser);

export default router;
