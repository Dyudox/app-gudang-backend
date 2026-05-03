import pool from "../config/db.js"; // Pastikan path ke db.js benar

export const getLaporanHarian = async (req, res) => {
  try {
    // 1. Ambil tanggal hari ini (Format: YYYY-MM-DD)
    const hariIni = new Date().toISOString().split("T")[0];

    // 2. Cek apakah sudah ada data rekap untuk hari ini
    const checkQuery =
      "SELECT 1 FROM stok_rekap WHERE tanggal_rekap = $1 LIMIT 1";
    const checkResult = await pool.query(checkQuery, [hariIni]);

    // 3. Jika belum ada (rowCount 0), jalankan prosedur tutup buku
    if (checkResult.rowCount === 0) {
      console.log(`Auto-generate rekap untuk tanggal: ${hariIni}`);
      await pool.query("CALL proses_tutup_buku($1)", [hariIni]);
    }

    // 4. Ambil data yang sudah siap (entah baru saja di-generate atau memang sudah ada)
    const selectQuery = `
        SELECT 
            sr.barang_id,
            b.nama_barang, 
            sr.saldo_awal,
            sr.saldo_akhir,
            sr.tanggal_rekap,
            -- Ambil dari tabel transaksi agar real-time dan akurat
            COALESCE(m.total_masuk, 0) as barang_masuk,
            COALESCE(k.total_keluar, 0) as barang_keluar,
            COALESCE(rb.total_baik, 0) as retur_baik,
            COALESCE(rr.total_rusak, 0) as retur_rusak
        FROM stok_rekap sr
        JOIN barang b ON sr.barang_id = b.id
        LEFT JOIN (
            SELECT barang_id, SUM(jumlah) as total_masuk 
            FROM transaksi_barang 
            WHERE tipe_transaksi = 'MASUK' AND DATE(created_at) = $1 
            GROUP BY barang_id
        ) m ON b.id = m.barang_id
        LEFT JOIN (
            SELECT barang_id, SUM(jumlah) as total_keluar 
            FROM transaksi_barang 
            WHERE tipe_transaksi = 'KELUAR' AND DATE(created_at) = $1 
            GROUP BY barang_id
        ) k ON b.id = k.barang_id
        LEFT JOIN (
            SELECT rd.barang_id, SUM(rd.jumlah) as total_baik 
            FROM retur_detail rd JOIN retur r ON rd.retur_id = r.id 
            WHERE rd.kondisi = 'BAIK' AND DATE(r.tanggal_retur) = $1 GROUP BY rd.barang_id
        ) rb ON b.id = rb.barang_id
        LEFT JOIN (
            SELECT rd.barang_id, SUM(rd.jumlah) as total_rusak 
            FROM retur_detail rd JOIN retur r ON rd.retur_id = r.id 
            WHERE rd.kondisi = 'RUSAK' AND DATE(r.tanggal_retur) = $1 GROUP BY rd.barang_id
        ) rr ON b.id = rr.barang_id
        WHERE sr.tanggal_rekap = $1
        ORDER BY b.nama_barang ASC
    `;

    // console.log("selectQuery:", selectQuery);

    const result = await pool.query(selectQuery, [hariIni]);

    // 5. Kirim respon ke Frontend
    res.status(200).json({
      status: "success",
      data: result.rows,
    });
  } catch (error) {
    console.error("Error saat memuat laporan:", error);
    res.status(500).json({ status: "error", message: "Gagal memuat laporan" });
  }
};

// generateRekapHarian

export const generateRekapHarian = async (req, res) => {
  const today = new Date().toISOString().split("T")[0]; // Format 'YYYY-MM-DD'

  try {
    // 1. Hapus data rekap hari ini jika sudah ada (agar bisa di-generate ulang)
    await pool.query("DELETE FROM stok_rekap WHERE tanggal_rekap = $1", [
      today,
    ]);

    // 2. Insert data rekap baru
    const query = `
        INSERT INTO stok_rekap (barang_id, saldo_awal, barang_masuk, barang_keluar, retur, saldo_akhir, tanggal_rekap)
        SELECT 
            b.id, 
            -- Saldo Awal: (Stok Saat Ini) - (Masuk) + (Keluar) - (Retur Baik) + (Retur Rusak)
            (b.stok - COALESCE(masuk.total_masuk, 0) + COALESCE(keluar.total_keluar, 0) - COALESCE(retur_baik.total, 0) + COALESCE(retur_rusak.total, 0)) as saldo_awal,
            COALESCE(masuk.total_masuk, 0) as barang_masuk,
            COALESCE(keluar.total_keluar, 0) as barang_keluar,
            COALESCE(retur_baik.total, 0) as retur, 
            b.stok as saldo_akhir,
            $1
        FROM barang b
        LEFT JOIN (
            SELECT barang_id, SUM(jumlah) as total_masuk 
            FROM transaksi_barang WHERE tipe_transaksi = 'MASUK' AND DATE(created_at) = $1 GROUP BY barang_id
        ) masuk ON b.id = masuk.barang_id
        LEFT JOIN (
            SELECT barang_id, SUM(jumlah) as total_keluar 
            FROM transaksi_barang WHERE tipe_transaksi = 'KELUAR' AND DATE(created_at) = $1 GROUP BY barang_id
        ) keluar ON b.id = keluar.barang_id
        -- Hitung retur berdasarkan data di retur_detail
        LEFT JOIN (
            SELECT rd.barang_id, SUM(rd.jumlah) as total 
            FROM retur_detail rd
            JOIN retur r ON rd.retur_id = r.id
            WHERE rd.kondisi = 'BAIK' AND DATE(r.tanggal_retur) = $1 GROUP BY rd.barang_id
        ) retur_baik ON b.id = retur_baik.barang_id
        LEFT JOIN (
            SELECT rd.barang_id, SUM(rd.jumlah) as total 
            FROM retur_detail rd
            JOIN retur r ON rd.retur_id = r.id
            WHERE rd.kondisi = 'RUSAK' AND DATE(r.tanggal_retur) = $1 GROUP BY rd.barang_id
        ) retur_rusak ON b.id = retur_rusak.barang_id
    `;

    await pool.query(query, [today]);

    res.status(200).json({ message: "Rekap berhasil di-generate!" });
  } catch (error) {
    console.error("Error saat generate rekap:", error);
    res.status(500).json({ message: "Gagal generate rekap: " + error.message });
  }
};

export const getDetailRetur = async (req, res) => {
  const { barangId } = req.params;
  const { kondisi } = req.query; // 'BAIK' atau 'RUSAK'

  console.log("DEBUG: Barang ID:", barangId, "Kondisi:", kondisi);

  const query = `
    SELECT r.tanggal_retur, rd.jumlah 
    FROM retur_detail rd
    JOIN retur r ON rd.retur_id = r.id
    WHERE rd.barang_id = $1 AND rd.kondisi = $2
  `;
  const result = await pool.query(query, [barangId, kondisi]);
  res.json(result.rows);
};
