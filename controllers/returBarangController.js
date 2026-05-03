import pool from "../config/db.js";

export const prosesRetur = async (req, res) => {
  const { transaksi_id, barang_id, jumlah, kondisi, catatan } = req.body;

  // PERBAIKAN: Ambil dari req.user yang sudah diisi oleh middleware
  const user_id = req.user.id;

  console.log("DEBUG: Proses Retur - User ID yang akan diinsert:", user_id);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Insert Header
    const returQuery = `
      INSERT INTO retur (transaksi_id, user_id) 
      VALUES ($1, $2) RETURNING id
    `;
    const returResult = await client.query(returQuery, [transaksi_id, user_id]);

    // Pastikan returResult ada isinya
    if (!returResult.rows[0]) {
      throw new Error("Gagal membuat header retur");
    }

    const retur_id = returResult.rows[0].id;

    // 2. Insert Detail
    const detailQuery = `
      INSERT INTO retur_detail (retur_id, barang_id, jumlah, kondisi, catatan) 
      VALUES ($1, $2, $3, $4, $5)
    `;
    await client.query(detailQuery, [
      retur_id,
      barang_id,
      jumlah,
      kondisi,
      catatan,
    ]);

    // 3. Update stok
    if (kondisi === "BAIK") {
      await client.query("UPDATE barang SET stok = stok + $1 WHERE id = $2", [
        jumlah,
        barang_id,
      ]);
    }

    await client.query("COMMIT");
    res.status(201).json({ message: "Retur berhasil diproses" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ERROR PROSES RETUR:", err.message);
    res.status(500).json({ error: "Gagal memproses retur: " + err.message });
  } finally {
    client.release();
  }
};
