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
        il.stok_lokasi as stok, 
        b.keterangan,
        g.nama_gudang as lokasi_gudang, 
        r.nama_rak as lokasi_rak
      FROM barang b
      LEFT JOIN inventory_locations il ON b.id = il.barang_id
      LEFT JOIN kategori_barang bg ON b.kategori_id = bg.id
      LEFT JOIN master_gudang g ON il.gudang_id = g.id
      LEFT JOIN master_rak r ON il.rak_id = r.id
      ORDER BY b.nama_barang ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// export const addLokasiBarang = async (req, res) => {
//   const { barang_id, gudang_id, rak_id, stok_lokasi } = req.body;

//   try {
//     const query = `
//       INSERT INTO inventory_locations (barang_id, gudang_id, rak_id, stok_lokasi)
//       VALUES ($1, $2, $3, $4)
//       ON CONFLICT (barang_id, gudang_id, rak_id)
//       DO UPDATE SET stok_lokasi = inventory_locations.stok_lokasi + EXCLUDED.stok_lokasi
//       RETURNING *;
//     `;

//     const result = await pool.query(query, [
//       barang_id,
//       gudang_id,
//       rak_id,
//       stok_lokasi,
//     ]);

//     res.status(201).json({
//       message: "Lokasi stok berhasil ditambahkan/diupdate",
//       data: result.rows[0],
//     });
//   } catch (err) {
//     res.status(500).json({ error: "Gagal menambah lokasi: " + err.message });
//   }
// };

// Tambah barang baru
export const addBarang = async (req, res) => {
  const { serial_number, nama_barang, merk, kategori_id, keterangan, barcode } =
    req.body;
  try {
    const result = await pool.query(
      `INSERT INTO barang (serial_number, nama_barang, merk, kategori_id, keterangan, barcode)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [serial_number, nama_barang, merk, kategori_id, keterangan, barcode],
    );
    res
      .status(201)
      .json({ message: "barang berhasil ditambahkan", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: "gagal menyimpan barang: " + err.message });
  }
};

export const tambahLokasi = async (req, res) => {
  const { barang_id, gudang_id, rak_id, stok_lokasi } = req.body;

  try {
    const query = `
      INSERT INTO inventory_locations (barang_id, gudang_id, rak_id, stok_lokasi)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (barang_id, gudang_id, rak_id) 
      DO UPDATE SET stok_lokasi = inventory_locations.stok_lokasi + EXCLUDED.stok_lokasi
    `;

    await pool.query(query, [barang_id, gudang_id, rak_id, stok_lokasi]);

    res.json({ message: "Lokasi/Stok berhasil ditambahkan/diupdate" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Gagal menambah lokasi: " + err.message });
  }
};

// export const getLokasiList = async (req, res) => {
//   try {
//     const gudang = await pool.query(
//       "SELECT DISTINCT nama_lokasi FROM master_rak WHERE nama_lokasi IS NOT NULL",
//     );
//     const rak = await pool.query(
//       "SELECT DISTINCT nama_rak FROM master_rak WHERE nama_rak IS NOT NULL",
//     );

//     res.json({
//       gudang: gudang.rows.map((item) => item.nama_lokasi),
//       rak: rak.rows.map((item) => item.nama_rak),
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// Update barang
export const updateBarang = async (req, res) => {
  const { id } = req.params;
  const {
    serial_number,
    nama_barang,
    merk,
    kategori_id,
    keterangan,
    // Lokasi dan stok tidak lagi di tabel barang,
    // jadi kita terima dari body jika perlu diupdate
    lokasi_gudang_id,
    lokasi_rak_id,
    stok_lokasi,
  } = req.body;

  try {
    // 1. Update tabel barang (info utama)
    const result = await pool.query(
      `UPDATE barang 
       SET serial_number=$1, nama_barang=$2, merk=$3, kategori_id=$4, keterangan=$5 
       WHERE id=$6 RETURNING *`,
      [serial_number, nama_barang, merk, kategori_id, keterangan, id],
    );

    if (result.rows.length === 0)
      return res.status(404).json({ error: "Barang tidak ditemukan" });

    res.json({
      message: "Data barang dan lokasi berhasil diperbarui",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error update:", err);
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
        b.kategori_id,
        bg.nama_kategori as kategori, 
        b.keterangan,
        json_agg(
          json_build_object(
            'lokasi_gudang', g.nama_gudang,
            'lokasi_rak', r.nama_rak,
            'stok', il.stok_lokasi
          )
        ) as daftar_lokasi
      FROM barang b
      LEFT JOIN inventory_locations il ON b.id = il.barang_id
      LEFT JOIN kategori_barang bg ON b.kategori_id = bg.id
      LEFT JOIN master_gudang g ON il.gudang_id = g.id
      LEFT JOIN master_rak r ON il.rak_id = r.id
      WHERE b.id = $1
      GROUP BY b.id, bg.nama_kategori
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

// // Ambil barang berdasarkan barcode
// export const getBarangByBarcode = async (req, res) => {
//   const { barcode } = req.params;
//   try {
//     // Menggunakan template literals
//     const result = await pool.query("SELECT * FROM barang WHERE barcode = $1", [
//       barcode,
//     ]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "Barang tidak ditemukan" });
//     }

//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // createTransaksi
// export const createTransaksi = async (req, res) => {
//   const { barang_id, tipe_transaksi, jumlah, keterangan } = req.body;

//   // Ambil user_id dari req.user (ini disuntikkan oleh middleware auth)
//   const user_id = req.user.id;

//   try {
//     // 1. Cek stok dulu jika tipe transaksinya KELUAR
//     if (tipe_transaksi === "KELUAR") {
//       const cekStok = await pool.query(
//         `SELECT stok_lokasi FROM inventory_locations WHERE id = ${barang_id}`,
//       );

//       if (cekStok.rows[0].stok < jumlah) {
//         return res.status(400).json({ message: "Stok tidak cukup!" });
//       }
//     }

//     // 2. Simpan transaksi (stok akan update otomatis via trigger di database)
//     const newTransaksi = await pool.query(
//       `INSERT INTO transaksi_barang (barang_id, user_id, tipe_transaksi, jumlah, keterangan)
//        VALUES (${barang_id}, ${user_id}, '${tipe_transaksi}', ${jumlah}, '${keterangan}')
//        RETURNING *`,
//     );

//     res.status(201).json({
//       message: "Transaksi berhasil!",
//       data: newTransaksi.rows[0],
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Ambil transaksi terbaru
// export const getRecentTransaksi = async (req, res) => {
//   try {
//     const result = await pool.query(`
//       SELECT t.*, b.nama_barang, b.merk, b.serial_number, u.username as nama_user
//       FROM transaksi_barang t
//       JOIN barang b ON t.barang_id = b.id
//       JOIN users u ON t.user_id = u.id
//       ORDER BY t.created_at DESC
//       LIMIT 10
//     `);
//     res.json(result.rows);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

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
