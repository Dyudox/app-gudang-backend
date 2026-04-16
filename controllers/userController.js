import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// 1. LOGIN USER
export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "User tidak ditemukan" });
    }

    const validPass = await bcrypt.compare(password, user.rows[0].password);
    if (!validPass) {
      return res.status(400).json({ error: "Password salah" });
    }

    const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: {
        id: user.rows[0].id,
        username: user.rows[0].username,
        full_name: user.rows[0].full_name,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 2. GET ALL USERS (DENGAN SEARCH & PAGING)
export const getUsers = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    let queryParams = [];
    let queryText = `
      SELECT u.id, u.username, u.full_name, u.user_group_id, g.nama_group_user as role 
      FROM users u 
      LEFT JOIN user_groups g ON u.user_group_id = g.id
    `;
    let countText = "SELECT COUNT(*) FROM users";

    if (search) {
      queryText += " WHERE u.username ILIKE $1 OR u.full_name ILIKE $1";
      countText += " WHERE username ILIKE $1 OR full_name ILIKE $1";
      queryParams.push(`%${search}%`);
    }

    const limitIdx = queryParams.length + 1;
    const offsetIdx = queryParams.length + 2;

    queryText += ` ORDER BY u.id ASC LIMIT $${limitIdx} OFFSET $${offsetIdx}`;

    const results = await pool.query(queryText, [
      ...queryParams,
      limit,
      offset,
    ]);
    const totalDataRes = await pool.query(countText, queryParams);
    const totalData = parseInt(totalDataRes.rows[0].count);

    res.json({
      data: results.rows,
      pagination: {
        totalData,
        totalPages: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 3. GET USER BY ID
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, username, full_name, user_group_id FROM users WHERE id = $1",
      [id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. REGISTER / TAMBAH USER BARU
export const register = async (req, res) => {
  const { username, password, full_name, user_group_id } = req.body;
  try {
    // Hash password sebelum simpan
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      "INSERT INTO users (username, password, full_name, user_group_id) VALUES ($1, $2, $3, $4) RETURNING id, username",
      [username, hashedPassword, full_name, user_group_id],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 5. UPDATE USER
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, full_name, user_group_id, password } = req.body;
  try {
    let result;
    if (password) {
      // Jika password ikut diupdate
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      result = await pool.query(
        "UPDATE users SET username=$1, full_name=$2, user_group_id=$3, password=$4 WHERE id=$5",
        [username, full_name, user_group_id, hashedPassword, id],
      );
    } else {
      // Update tanpa ganti password
      result = await pool.query(
        "UPDATE users SET username=$1, full_name=$2, user_group_id=$3 WHERE id=$4",
        [username, full_name, user_group_id, id],
      );
    }
    res.json({ message: "User berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 6. DELETE USER
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id = $1", [id]);
    res.json({ message: "User berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
