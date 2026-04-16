import pool from "../config/db.js";

// @desc    Ambil semua kategori barang
// @route   GET /api/kategori
export const kategori = async (req, res) => {
  // search, page, dan limit
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // 1. Query Dasar & Search
    let queryText = "SELECT * FROM kategori_barang";
    let countText = "SELECT COUNT(*) FROM kategori_barang";
    let queryParams = [];

    if (search) {
      queryText += " WHERE nama_kategori ILIKE $1 OR deskripsi ILIKE $1";
      countText += " WHERE nama_kategori ILIKE $1 OR deskripsi ILIKE $1";
      queryParams.push(`%${search}%`);
    }

    // 2. Sort & Pagination
    queryText += ` ORDER BY id ASC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    const results = await pool.query(queryText, [
      ...queryParams,
      limit,
      offset,
    ]);

    // 3. Hitung Total Data untuk Info di Frontend
    const totalData = await pool.query(countText, queryParams);
    const totalPages = Math.ceil(parseInt(totalData.rows[0].count) / limit);

    return res.json({
      data: results.rows,
      pagination: {
        totalData: parseInt(totalData.rows[0].count),
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit),
      },
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM kategori_barang ORDER BY id ASC",
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error kategori:", err.message);
    res.status(500).json({ error: "Gagal mengambil data kategori" });
  }
};

// @desc    Tambah kategori baru
// @route   POST /api/kategori
export const addKategori = async (req, res) => {
  const { nama_kategori, deskripsi } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO kategori_barang (nama_kategori, deskripsi) VALUES ($1, $2) RETURNING *",
      [nama_kategori, deskripsi],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error addKategori:", err.message);
    res.status(500).json({ error: "Gagal menambah kategori" });
  }
};

// @desc    Update kategori
// @route   PUT /api/kategori/:id
export const updateKategori = async (req, res) => {
  const { id } = req.params;
  const { nama_kategori, deskripsi } = req.body;

  try {
    const result = await pool.query(
      "UPDATE kategori_barang SET nama_kategori = $1, deskripsi = $2 WHERE id = $3 RETURNING *",
      [nama_kategori, deskripsi, id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Kategori tidak ditemukan" });
    }

    res.json({ message: "Kategori berhasil diperbarui", data: result.rows[0] });
  } catch (err) {
    console.error("Error updateKategori:", err.message);
    res.status(500).json({ error: "Gagal memperbarui kategori" });
  }
};

// @desc    Hapus kategori
// @route   DELETE /api/kategori/:id
export const deleteKategori = async (req, res) => {
  const { id } = req.params;

  try {
    // Opsional: Cek dulu apakah kategori ini sedang dipakai oleh tabel barang
    // const checkBarang = await pool.query("SELECT id FROM barang WHERE kategori_id = $1 LIMIT 1", [id]);
    // if (checkBarang.rows.length > 0) {
    //   return res.status(400).json({ error: "Kategori tidak bisa dihapus karena masih digunakan oleh data barang" });
    // }

    const result = await pool.query(
      "DELETE FROM kategori_barang WHERE id = $1 RETURNING *",
      [id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Kategori tidak ditemukan" });
    }

    res.json({ message: "Kategori berhasil dihapus" });
  } catch (err) {
    console.error("Error deleteKategori:", err.message);
    res.status(500).json({ error: "Gagal menghapus kategori" });
  }
};
