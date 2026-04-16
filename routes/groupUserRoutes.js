import express from "express";
import * as groupCtrl from "../controllers/groupController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, groupCtrl.getAllGroups);
router.post("/", auth, groupCtrl.addGroup);
router.put("/:id", auth, groupCtrl.updateGroup);
router.delete("/:id", auth, groupCtrl.deleteGroup);

export default router;
