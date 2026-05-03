import express from "express";
import { getMutasi, createMutasi } from "../controllers/mutasiController.js";

const router = express.Router();

router.get("/", getMutasi);
router.post("/", createMutasi);

export default router;
