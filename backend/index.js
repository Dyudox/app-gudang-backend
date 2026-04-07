import express from "express";
import pkg from "pg";
const { Pool } = pkg;
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// --- MIDDLEWARE KEAMANAN (SATUAN TUGAS JWT) ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Format: Bearer <TOKEN>

  if (!token)
    return res.status(401).json({ error: "Akses ditolak! Anda belum login." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err)
      return res
        .status(403)
        .json({ error: "Token tidak valid atau sudah kedaluwarsa." });
    req.user = user; // Menyimpan data user (id, username) ke request
    next();
  });
};

// --- AUTH ROUTES ---

// 1. Register User Baru
app.post("/api/auth/register", async (req, res) => {
  const { username, password, full_name, user_group_id } = req.body;
  try {
    // Mengacak password agar aman di database
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, password, full_name, user_group_id) VALUES ($1, $2, $3, $4) RETURNING id, username",
      [username, hashedPassword, full_name, user_group_id],
    );

    res.status(201).json({
      message: "User berhasil didaftarkan",
      user: result.rows[0],
    });
  } catch (err) {
    // Jika username sudah ada, PostgreSQL akan melempar error
    res
      .status(500)
      .json({ error: "Username sudah digunakan atau data tidak lengkap" });
  }
});

// 2. Login (Menghasilkan Token)
app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const userResult = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );
    const user = userResult.rows[0];

    if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(401).json({ error: "Password salah" });

    // Buat Token (Masa berlaku 1 hari)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.user_group_id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Login Berhasil",
      token,
      user: { username: user.username, name: user.full_name },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Logout (Sisi Backend)
app.post("/api/auth/logout", (req, res) => {
  // Karena kita pakai JWT (Stateless), kita tidak perlu hapus apa pun di server.
  // Cukup beri respon sukses agar Frontend tahu proses logout dimulai.
  res.json({ message: "Logout berhasil. SIlakan hapus token di sisi client." });
});

// --- PROTECTED ROUTES (Hanya bisa dibuka jika bawa Token) ---

// Ambil Data Barang VSAT
app.get("/api/barang", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, bg.nama_group 
      FROM barang b 
      LEFT JOIN barang_groups bg ON b.group_id = bg.id 
      ORDER BY b.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend Running on port ${PORT}`));
