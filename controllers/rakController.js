import pool from "../config/db.js"; // Sesuaikan dengan koneksi db kamu

export const getAllRak = async (req, res) => {
  try {
    // Kita ambil data dari tabel master_rak
    const query = `SELECT * FROM master_rak ORDER BY id ASC`;

    const result = await pool.query(query);
    res.status(200).json({ status: "success", data: result.rows });

    // const result = await pool.query(query);
    // res.status(200).json({ status: "success", data: result.rows });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data rak", error: err.message });
  }
};
