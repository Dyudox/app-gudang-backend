import express from "express";
import cors from "cors";
import "dotenv/config";

// Import Routes (WAJIB pakai ekstensi .js)
import authRoutes from "./routes/authRoutes.js";
import barangRoutes from "./routes/barangRoutes.js";
import kategoriRoutes from "./routes/kategoriRoutes.js";

import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import groupUserRoutes from "./routes/groupUserRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

// Pemetaan Route
app.use("/api/auth", authRoutes);
app.use("/api/barang", barangRoutes);
app.use("/api/kategori", kategoriRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user-groups", groupUserRoutes);

const port = process.env.port || 5000;
app.listen(port, () =>
  console.log(`🚀 Backend modular running on port ${port}`),
);
