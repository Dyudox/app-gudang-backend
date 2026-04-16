import express from "express";
// Import fungsi secara spesifik (Destructuring)
import {
  getUsers,
  getUserById,
  register,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Gunakan langsung nama fungsinya
router.get("/", auth, getUsers);
router.get("/:id", auth, getUserById);
router.post("/", auth, register);
router.put("/:id", auth, updateUser);
router.delete("/:id", auth, deleteUser);

export default router;

// import express from "express";
// import * as authCtrl from "../controllers/authController.js";
// import auth from "../middleware/auth.js";

// const router = express.Router();

// // Gunakan "auth" agar hanya admin/user login yang bisa akses
// router.get("/", authCtrl.getUsers);
// router.get("/:id", auth, authCtrl.getUserById);
// router.post("/", auth, authCtrl.register); // Admin tambah user baru
// router.put("/:id", auth, authCtrl.updateUser);
// router.delete("/:id", auth, authCtrl.deleteUser);

// export default router;
