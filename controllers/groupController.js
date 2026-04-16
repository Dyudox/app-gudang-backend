import pool from "../config/db.js";

// 2. GET ALL USERS GROUP (DENGAN SEARCH & PAGING)
export const getAllGroups = async (req, res) => {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const offset = (page - 1) * limit;

    let queryParams = [];
    let queryText = "SELECT * FROM user_groups";
    let countText = "SELECT COUNT(*) FROM user_groups";

    if (search) {
      queryText += " WHERE nama_group_user ILIKE $1 OR deskripsi ILIKE $1";
      countText += " WHERE nama_group_user ILIKE $1 OR deskripsi ILIKE $1";
      queryParams.push(`%${search}%`);
    }

    const limitIdx = queryParams.length + 1;
    const offsetIdx = queryParams.length + 2;
    queryText += ` ORDER BY id ASC LIMIT $${limitIdx} OFFSET $${offsetIdx}`;

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

export const addGroup = async (req, res) => {
  const { nama_group_user, deskripsi } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO user_groups (nama_group_user, deskripsi) VALUES ($1, $2) RETURNING *",
      [nama_group_user, deskripsi],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateGroup = async (req, res) => {
  const { id } = req.params;
  const { nama_group_user, deskripsi } = req.body;
  try {
    await pool.query(
      "UPDATE user_groups SET nama_group_user = $1, deskripsi = $2 WHERE id = $3",
      [nama_group_user, deskripsi, id],
    );
    res.json({ message: "Group berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteGroup = async (req, res) => {
  const { id } = req.params;
  try {
    // Cek dulu apakah masih ada user yang pakai group ini
    const checkUser = await pool.query(
      "SELECT id FROM users WHERE user_group_id = $1 LIMIT 1",
      [id],
    );
    if (checkUser.rows.length > 0) {
      return res.status(400).json({
        error: "Grup tidak bisa dihapus karena masih digunakan oleh user!",
      });
    }

    await pool.query("DELETE FROM user_groups WHERE id = $1", [id]);
    res.json({ message: "Group berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
