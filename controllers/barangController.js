import pool from "../config/db.js";

// Ambil semua data barang
export const getAllBarang = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id, b.serial_number, b.nama_barang, b.merk, 
        bg.nama_kategori as kategori, b.stok, b.lokasi_rak, b.keterangan
      FROM barang b
      LEFT JOIN kategori_barang bg ON b.kategori_id = bg.id
      ORDER BY b.nama_barang ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tambah barang baru
export const addBarang = async (req, res) => {
  const {
    serial_number,
    nama_barang,
    merk,
    kategori_id,
    stok,
    lokasi_rak,
    keterangan,
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO barang (serial_number, nama_barang, merk, kategori_id, stok, lokasi_rak, keterangan)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        serial_number,
        nama_barang,
        merk,
        kategori_id,
        stok,
        lokasi_rak,
        keterangan,
      ],
    );
    res
      .status(201)
      .json({ message: "barang berhasil ditambahkan", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "gagal menyimpan barang: " + err.message });
  }
};

// Update barang
export const updateBarang = async (req, res) => {
  const { id } = req.params;
  const {
    serial_number,
    nama_barang,
    merk,
    kategori_id,
    stok,
    lokasi_rak,
    keterangan,
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE barang
       SET serial_number=$1, nama_barang=$2, merk=$3, kategori_id=$4, stok=$5, lokasi_rak=$6, keterangan=$7
       WHERE id=$8 RETURNING *`,
      [
        serial_number,
        nama_barang,
        merk,
        kategori_id,
        stok,
        lokasi_rak,
        keterangan,
        id,
      ],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "barang tidak ditemukan" });
    res.json({
      message: "data barang berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Hapus barang
export const deleteBarang = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "DELETE FROM barang WHERE id = $1 RETURNING *",
      [id],
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "barang tidak ditemukan" });
    res.json({ message: "barang berhasil dihapus dari sistem" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ambil satu barang berdasarkan ID
export const getBarangById = async (req, res) => {
  const { id } = req.params; // Mengambil ID dari URL
  try {
    const result = await pool.query("SELECT * FROM barang WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      // Jika ID tidak ada di database, kirim 404
      return res.status(404).json({ error: "Barang tidak ditemukan" });
    }

    // Kirim data barang ke frontend
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ambil daftar kategori/groups
export const getGroups = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, nama_kategori FROM kategori_barang ORDER BY nama_kategori ASC",
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ambil barang berdasarkan barcode
export const getBarangByBarcode = async (req, res) => {
  const { barcode } = req.params;
  try {
    // Menggunakan template literals
    const result = await pool.query(
      `SELECT * FROM barang WHERE barcode = '${barcode}'`,
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Barang tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// createTransaksi
export const createTransaksi = async (req, res) => {
  const { barang_id, tipe_transaksi, jumlah, keterangan } = req.body;

  // Ambil user_id dari req.user (ini disuntikkan oleh middleware auth)
  const user_id = req.user.id;

  try {
    // 1. Cek stok dulu jika tipe transaksinya KELUAR
    if (tipe_transaksi === "KELUAR") {
      const cekStok = await pool.query(
        `SELECT stok FROM barang WHERE id = ${barang_id}`,
      );

      if (cekStok.rows[0].stok < jumlah) {
        return res.status(400).json({ message: "Stok tidak cukup!" });
      }
    }

    // 2. Simpan transaksi (stok akan update otomatis via trigger di database)
    const newTransaksi = await pool.query(
      `INSERT INTO transaksi_barang (barang_id, user_id, tipe_transaksi, jumlah, keterangan) 
       VALUES (${barang_id}, ${user_id}, '${tipe_transaksi}', ${jumlah}, '${keterangan}') 
       RETURNING *`,
    );

    res.status(201).json({
      message: "Transaksi berhasil!",
      data: newTransaksi.rows[0],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Ambil transaksi terbaru
export const getRecentTransaksi = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, b.nama_barang, b.merk, b.serial_number, u.username as nama_user
      FROM transaksi_barang t
      JOIN barang b ON t.barang_id = b.id
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
      LIMIT 10
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
