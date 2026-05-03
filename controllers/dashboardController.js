import pool from "../config/db.js";

export const getStats = async (req, res) => {
  try {
    const totalbarang = await pool.query("SELECT COUNT(*) FROM barang");
    const totaluser = await pool.query("SELECT COUNT(*) FROM users");
    const totalTransaksiHariIni = await pool.query(
      "SELECT COUNT(*) FROM transaksi_barang WHERE DATE(created_at) = CURRENT_DATE",
    );
    const stokrendah = await pool.query(
      "SELECT COUNT(*) FROM barang WHERE stok < 5",
    );

    res.json({
      totalBarang: Number(totalbarang.rows[0].count),
      totalUser: Number(totaluser.rows[0].count),
      totalTransaksiHariIni: Number(totalTransaksiHariIni.rows[0].count),
      stokRendah: Number(stokrendah.rows[0].count),
    });
  } catch (err) {
    console.error("Error getStats:", err.message);
    res.status(500).json({ error: "Gagal mengambil statistik" });
  }
};

export const getCharts = async (req, res) => {
  try {
    // 1. Data untuk Bar Chart: Jumlah barang per kategori
    const bardata = await pool.query(`
      SELECT kb.nama_kategori AS name, COUNT(b.id)::int AS total
      FROM kategori_barang kb
      LEFT JOIN barang b ON b.kategori_id = kb.id
      GROUP BY kb.nama_kategori
    `);

    // 2. Data untuk Line & Area Chart (DIPERBAIKI)
    // Kita ambil 'masuk', 'keluar', dan 'stok' (total pergerakan) dalam satu query
    const linedata = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'DD Mon') AS name, 
        TO_CHAR(created_at, 'DD Mon') AS tanggal, -- Untuk kompatibilitas frontend
        SUM(CASE WHEN tipe_transaksi = 'MASUK' THEN jumlah ELSE 0 END)::int AS masuk,
        SUM(CASE WHEN tipe_transaksi = 'KELUAR' THEN jumlah ELSE 0 END)::int AS keluar,
        /* SUM(CASE WHEN tipe_transaksi = 'PENDING' THEN jumlah ELSE 0 END)::int AS pending, */
        SUM(jumlah)::int AS stok
      FROM transaksi_barang
      WHERE created_at > CURRENT_DATE - INTERVAL '7 days'
      GROUP BY TO_CHAR(created_at, 'DD Mon'), DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);

    // Format data untuk dikirim ke frontend
    const finalLineData =
      linedata.rows.length > 0
        ? linedata.rows
        : [
            {
              name: "No Data",
              tanggal: "No Data",
              masuk: 0,
              keluar: 0,
              // pending: 0,
              stok: 0,
            },
          ];

    res.json({
      barData: bardata.rows,
      lineData: finalLineData,
    });
  } catch (err) {
    console.error("Error getCharts:", err.message);
    res.status(500).json({ error: "Gagal mengambil data grafik" });
  }
};
