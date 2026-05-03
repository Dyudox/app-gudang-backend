import pool from "../config/db.js"; // Sesuaikan dengan koneksi db-mu

export const getAllLokasi = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM master_lokasi WHERE is_active = TRUE ORDER BY nama_lokasi ASC",
    );
    res.status(200).json({ data: result.rows });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data lokasi", error: err.message });
  }
};
