import pool from "../config/db.js";

export const createTransaksi = async (req, res) => {
  const {
    barang_id,
    gudang_id,
    rak_id,
    jumlah,
    tipe_transaksi,
    keterangan, // bisa undefined
    kode_transaksi, // bisa undefined
  } = req.body;

  // Mengambil user_id langsung dari middleware autentikasi (req.user)
  const user_id = req.user.id;

  try {
    await pool.query("BEGIN");

    // 1. Validasi Stok (hanya jika transaksi KELUAR)
    if (tipe_transaksi === "KELUAR") {
      const cekStok = await pool.query(
        `SELECT stok_lokasi FROM inventory_locations 
         WHERE barang_id = $1 AND gudang_id = $2 AND rak_id = $3 FOR UPDATE`,
        [barang_id, gudang_id, rak_id],
      );

      if (cekStok.rows.length === 0 || cekStok.rows[0].stok_lokasi < jumlah) {
        throw new Error("Stok tidak mencukupi di lokasi yang dipilih.");
      }
    }

    // 2. Insert ke transaksi_barang (Gunakan null jika data kosong)
    await pool.query(
      `INSERT INTO transaksi_barang 
        (barang_id, gudang_id, rak_id, jumlah, tipe_transaksi, keterangan, user_id, kode_transaksi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        barang_id,
        gudang_id,
        rak_id,
        jumlah,
        tipe_transaksi,
        keterangan || null,
        user_id || null, // Jika user_id tidak ada, isi null
        kode_transaksi || `TXN-${Date.now()}`, // Fallback ID jika tidak dikirim
      ],
    );

    // 3. Update stok dengan TYPE CASTING (Solusi Error Anda)
    // Kita berikan ::integer agar PostgreSQL tahu ini operasi angka
    const multiplier = tipe_transaksi === "MASUK" ? 1 : -1;
    await pool.query(
      `UPDATE inventory_locations 
       SET stok_lokasi = stok_lokasi + ($1::integer * $2::integer)
       WHERE barang_id = $3 AND gudang_id = $4 AND rak_id = $5`,
      [jumlah, multiplier, barang_id, gudang_id, rak_id],
    );

    await pool.query("COMMIT");
    res.status(201).json({ message: "Transaksi berhasil diproses." });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error Transaksi:", err);
    res.status(400).json({ error: err.message });
  }
};

export const getRiwayatTransaksi = async (req, res) => {
  try {
    const query = `
      SELECT t.*, b.nama_barang, g.nama_gudang, r.nama_rak 
      FROM transaksi_barang t
      JOIN barang b ON t.barang_id = b.id
      JOIN master_gudang g ON t.gudang_id = g.id
      JOIN master_rak r ON t.rak_id = r.id
      ORDER BY t.created_at DESC LIMIT 50`;

    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const cariBarangBySN = async (req, res) => {
  const { sn } = req.params;
  try {
    const query = `
        SELECT b.id, b.nama_barang, b.serial_number, 
            -- Pastikan Anda menjumlahkan stok dari semua lokasi untuk total stok
            (SELECT SUM(stok_lokasi) FROM inventory_locations WHERE barang_id = b.id) as total_stok,
            il.gudang_id, il.rak_id, il.stok_lokasi,
            mg.nama_gudang, mr.nama_rak
        FROM barang b
        LEFT JOIN inventory_locations il ON b.id = il.barang_id
        LEFT JOIN master_gudang mg ON il.gudang_id = mg.id
        LEFT JOIN master_rak mr ON il.rak_id = mr.id
        WHERE b.serial_number = $1
  `;

    const result = await pool.query(query, [sn]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Barang tidak ditemukan" });
    }

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

//
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

export const getRiwayat = async (req, res) => {
  const { start_date, end_date, tipe } = req.query;

  // 1. Definisikan Base Query TANPA Order By di tengah
  let query = `
    SELECT 
      t.*, 
      b.nama_barang, 
      g.nama_gudang, 
      r.nama_rak, 
      u.full_name AS nama_user 
    FROM transaksi_barang t
    JOIN barang b ON t.barang_id = b.id
    JOIN master_gudang g ON t.gudang_id = g.id
    JOIN master_rak r ON t.rak_id = r.id
    LEFT JOIN users u ON t.user_id = u.id 
    WHERE 1=1
  `;

  const params = [];

  // 2. Filter Tanggal (Pastikan urutan placeholder $1, $2 benar)
  if (start_date && end_date) {
    params.push(start_date);
    query += ` AND t.created_at >= $${params.length} `;

    params.push(end_date);
    query += ` AND t.created_at <= $${params.length} `;
  }

  // 3. Filter Tipe
  if (tipe) {
    params.push(tipe);
    query += ` AND t.tipe_transaksi = $${params.length} `;
  }

  // 4. Tambahkan Order By HANYA DI AKHIR
  query += ` ORDER BY t.created_at DESC `;

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("SQL Error:", err.message); // Agar terlihat di log terminal backend
    res.status(500).json({ error: err.message });
  }
};
