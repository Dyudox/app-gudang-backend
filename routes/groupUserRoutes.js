import express from "express";
import * as groupCtrl from "../controllers/groupController.js";
import { authenticateToken, authorizeRole } from "../middleware/auth.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

router.get(
  "/",
  authenticateToken,
  authorizeRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]),
  groupCtrl.getAllGroups,
);
router.post(
  "/",
  authenticateToken,
  authorizeRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]),
  groupCtrl.addGroup,
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]),
  groupCtrl.updateGroup,
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([ROLES.ADMIN, ROLES.MANAGER, ROLES.STAFF]),
  groupCtrl.deleteGroup,
);

export default router;
