import pool from "../config/db.js";

export const getMutasi = async (req, res) => {
  try {
    const query = `
      SELECT m.*, b.nama_barang 
      FROM mutasi_barang m
      JOIN barang b ON m.barang_id = b.id
      ORDER BY m.created_at DESC
    `;
    const result = await pool.query(query);
    res.status(200).json({ status: "success", data: result.rows });
  } catch (error) {
    res.status(500).json({ message: "Gagal ambil data mutasi" });
  }
};

export const createMutasi = async (req, res) => {
  const {
    barang_id,
    jumlah,
    gudang_asal,
    rak_asal,
    gudang_tujuan,
    rak_tujuan,
    keterangan,
  } = req.body;
  const jumlahInt = parseInt(jumlah);

  try {
    await pool.query("BEGIN"); // Memulai transaksi

    // 1. Cek stok barang
    const cekStok = await pool.query("SELECT stok FROM barang WHERE id = $1", [
      barang_id,
    ]);
    if (cekStok.rows[0].stok < jumlahInt) {
      throw new Error("Stok tidak mencukupi!");
    }

    // 2. Kurangi stok di barang (asumsi ini adalah gudang induk)
    await pool.query("UPDATE barang SET stok = stok - $1 WHERE id = $2", [
      jumlahInt,
      barang_id,
    ]);

    // 3. Update lokasi rak barang ke tujuan
    // (Jika mutasi berarti pindah rak, kita update lokasi_rak-nya)
    await pool.query("UPDATE barang SET lokasi_rak = $1 WHERE id = $2", [
      rak_tujuan,
      barang_id,
    ]);

    // 4. Catat ke tabel mutasi
    await pool.query(
      `INSERT INTO mutasi_barang (barang_id, jumlah, gudang_asal, rak_asal, gudang_tujuan, rak_tujuan, keterangan) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        barang_id,
        jumlahInt,
        gudang_asal,
        rak_asal,
        gudang_tujuan,
        rak_tujuan,
        keterangan,
      ],
    );

    await pool.query("COMMIT"); // Simpan semua
    res.status(201).json({ message: "Mutasi berhasil & lokasi terupdate" });
  } catch (err) {
    await pool.query("ROLLBACK"); // Batalkan semua
    res.status(500).json({ message: err.message });
  }
};
