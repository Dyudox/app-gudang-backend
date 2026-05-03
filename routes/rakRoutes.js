import express from "express";
import { getAllRak } from "../controllers/rakController.js";

const router = express.Router();

router.get("/", getAllRak);

export default router;
