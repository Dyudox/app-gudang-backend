import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 1. Register User Baru
export const register = async (req, res) => {
  const { username, password, full_name, user_group_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, password, full_name, user_group_id) VALUES ($1, $2, $3, $4) RETURNING id, username",
      [username, hashedPassword, full_name, user_group_id],
    );
    res
      .status(201)
      .json({ message: "User berhasil didaftarkan", user: result.rows[0] });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Username sudah digunakan atau data tidak lengkap" });
  }
};

// 2. Login
export const login = async (req, res) => {
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

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.user_group_id },
      process.env.jwt_secret,
      { expiresIn: "24h" },
    );

    res.json({
      message: "Login berhasil",
      token,
      user: { username: user.username, name: user.full_name },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. Logout
export const logout = (req, res) => {
  res.json({ message: "Logout berhasil. Silakan hapus token di sisi client." });
};

// 4. Ambil Semua User
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, full_name, user_group_id FROM users ORDER BY id ASC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. Ambil User Berdasarkan ID
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, username, full_name, user_group_id FROM users WHERE id = $1",
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "User tidak ditemukan" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. Update User
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, full_name, user_group_id, password } = req.body;
  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        "UPDATE users SET username=$1, full_name=$2, user_group_id=$3, password=$4 WHERE id=$5",
        [username, full_name, user_group_id, hashedPassword, id],
      );
    } else {
      await pool.query(
        "UPDATE users SET username=$1, full_name=$2, user_group_id=$3 WHERE id=$4",
        [username, full_name, user_group_id, id],
      );
    }
    res.json({ message: "User berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ error: "Username mungkin sudah digunakan" });
  }
};

// 7. Hapus User
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
