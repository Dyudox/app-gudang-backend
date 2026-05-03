import express from "express";
import cors from "cors";
import "dotenv/config";

// Import Routes (WAJIB pakai ekstensi .js)
import authRoutes from "./routes/authRoutes.js";
import barangRoutes from "./routes/barangRoutes.js";
import kategoriRoutes from "./routes/kategoriRoutes.js";

import rakRoutes from "./routes/rakRoutes.js";

import dashboardRoutes from "./routes/dashboardRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import groupUserRoutes from "./routes/groupUserRoutes.js";
import returRoutes from "./routes/returRoutes.js";

import laporanRoutes from "./routes/laporanRoutes.js";
import mutasiRoutes from "./routes/mutasiRoutes.js";
import lokasiRoutes from "./routes/lokasiRoutes.js";

const app = express();
app.use(
  cors({
    origin: ["http://localhost:5173"], // Sesuaikan dengan port frontend-mu
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // WAJIB jika kamu mengirim token/cookie
  }),
);

app.use(express.json());

// Pemetaan Route
app.use("/api/auth", authRoutes);
app.use("/api/barang", barangRoutes);
app.use("/api/kategori", kategoriRoutes);
app.use("/api/retur", returRoutes);
app.use("/api/laporan", laporanRoutes);
app.use("/api/rak", rakRoutes);

app.use("/api/mutasi", mutasiRoutes);
app.use("/api/lokasi", lokasiRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/user-groups", groupUserRoutes);

const port = process.env.port || 5000;
app.listen(port, () =>
  console.log(`🚀 Backend modular running on port ${port}`),
);
