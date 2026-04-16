import pool from "../config/db.js";

export const getStats = async (req, res) => {
  try {
    const totalbarang = await pool.query("select count(*) from barang");
    const totaluser = await pool.query("select count(*) from users");
    const totalkategori = await pool.query(
      "select count(*) from kategori_barang",
    );
    const stokrendah = await pool.query(
      "select count(*) from barang where stok < 5",
    );

    // PASTIKAN KEY NYA SAMA DENGAN FRONTEND (Case Sensitive)
    // Gunakan Number() karena PostgreSQL mengembalikan count sebagai string
    res.json({
      totalBarang: Number(totalbarang.rows[0].count),
      totalUser: Number(totaluser.rows[0].count),
      totalKategori: Number(totalkategori.rows[0].count),
      stokRendah: Number(stokrendah.rows[0].count),
    });
  } catch (err) {
    console.error("Error getStats:", err.message);
    res.status(500).json({ error: err.message });
  }
};

export const getCharts = async (req, res) => {
  try {
    const bardata = await pool.query(`
      select kb.nama_kategori as name, count(b.id)::int as total
      from kategori_barang kb
      left join barang b on b.kategori_id = kb.id
      group by kb.nama_kategori
    `);

    const linedata = [
      { name: "Jan", stok: 40 },
      { name: "Feb", stok: 30 },
      { name: "Mar", stok: 60 },
      { name: "Apr", stok: 45 },
    ];

    // Frontend mengharapkan 'barData' dan 'lineData' (CamelCase)
    res.json({
      barData: bardata.rows,
      lineData: linedata,
    });
  } catch (err) {
    console.error("Error getCharts:", err.message);
    res.status(500).json({ error: err.message });
  }
};
