import pool from "../config/db.js";

// Ambil semua data barang
export const getAllBarang = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        b.id, 
        b.serial_number, 
        b.nama_barang, 
        b.merk, 
        bg.nama_kategori as kategori, 
        b.stok, 
        b.keterangan,
        g.nama_gudang as lokasi_gudang, 
        r.nama_rak as lokasi_rak
      FROM barang b
      LEFT JOIN kategori_barang bg ON b.kategori_id = bg.id
      LEFT JOIN master_gudang g ON b.lokasi_gudang::integer = g.id
      LEFT JOIN master_rak r ON b.lokasi_rak::integer = r.id
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
    lokasi_gudang,
    barcode,
  } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO barang (serial_number, nama_barang, merk, kategori_id, stok, lokasi_rak, keterangan, lokasi_gudang, barcode)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        serial_number,
        nama_barang,
        merk,
        kategori_id,
        stok,
        lokasi_rak,
        keterangan,
        lokasi_gudang,
        barcode,
      ],
    );
    res
      .status(201)
      .json({ message: "barang berhasil ditambahkan", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "gagal menyimpan barang: " + err.message });
  }
};

export const getLokasiList = async (req, res) => {
  try {
    const gudang = await pool.query(
      "SELECT DISTINCT nama_lokasi FROM master_rak WHERE nama_lokasi IS NOT NULL",
    );
    const rak = await pool.query(
      "SELECT DISTINCT nama_rak FROM master_rak WHERE nama_rak IS NOT NULL",
    );

    res.json({
      gudang: gudang.rows.map((item) => item.nama_lokasi),
      rak: rak.rows.map((item) => item.nama_rak),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    lokasi_gudang,
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE barang
       SET serial_number=$1, nama_barang=$2, merk=$3, kategori_id=$4, stok=$5, lokasi_rak=$6, lokasi_gudang=$7, keterangan=$8
       WHERE id=$9 RETURNING *`,
      [
        serial_number,
        nama_barang,
        merk,
        kategori_id,
        stok,
        lokasi_rak,
        lokasi_gudang,
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
  try {
    const { id } = req.params; // Mengambil ID dari URL
    //const result = await pool.query("SELECT * FROM barang WHERE id = $1", [id]);

    const result = await pool.query(
      `
      SELECT
        b.id,
        b.serial_number,
        b.nama_barang,
        b.merk,
        b.kategori_id,          -- Ambil ID aslinya untuk form
        bg.nama_kategori as kategori,
        b.stok,
        b.keterangan,
        b.lokasi_gudang as lokasi_gudang, -- Ini tetap ID aslinya
        g.nama_gudang as nama_gudang_display, -- Ini untuk tampilan/referensi jika perlu
        b.lokasi_rak as lokasi_rak,       -- Ini tetap ID aslinya
        r.nama_rak as nama_rak_display
      FROM barang b
      LEFT JOIN kategori_barang bg ON b.kategori_id = bg.id
      LEFT JOIN master_gudang g ON b.lokasi_gudang::integer = g.id
      LEFT JOIN master_rak r ON b.lokasi_rak::integer = r.id
      WHERE b.id = $1
    `,
      [id],
    );

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
    const result = await pool.query("SELECT * FROM barang WHERE barcode = $1", [
      barcode,
    ]);

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

// Tambahkan fungsi getGudangList di sini
export const getGudangList = async (req, res) => {
  try {
    // console.log("Mengeksekusi query getGudangList..."); // <--- Tambah ini
    const query = "SELECT * FROM master_gudang";
    const result = await pool.query(query);

    // console.log("Query berhasil, mengirim data..."); // <--- Tambah ini

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("ERROR DI BACKEND:", error); // <--- INI PALING PENTING
    res
      .status(500)
      .json({ message: "Gagal ambil gudang", error: error.message });
  }
};

// Tambahkan juga fungsi getRakByGudang jika sudah siap
export const getRakByGudang = async (req, res) => {
  const { gudang_id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM master_rak WHERE gudang_id = $1 AND is_active = true`,
      [gudang_id],
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
