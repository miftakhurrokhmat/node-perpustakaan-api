const { pool } = require('../config/db');

exports.createPeminjaman = async (req, res) => {
  const { id_anggota, id_staf, tanggal_pinjam, items } = req.body;
  // Format items: [{ id_buku: 1, jumlah: 2 }, { id_buku: 3, jumlah: 1 }]

  if (!id_anggota || !id_staf || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Data peminjaman tidak lengkap' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Simpan header peminjaman
    const insertPinjamQuery = `
      INSERT INTO peminjaman (id_anggota, id_staf, tanggal_pinjam)
      VALUES ($1, $2, $3)
      RETURNING id_pinjam;
    `;
    const pinjamRes = await client.query(insertPinjamQuery, [
      id_anggota,
      id_staf,
      tanggal_pinjam || new Date(),
    ]);
    const idPinjam = pinjamRes.rows[0].id_pinjam;

    // 2. Iterasi buku, validasi stok, catat detail, dan kurangi stok
    for (const item of items) {
      const checkStokRes = await client.query(
        'SELECT stok FROM buku WHERE id_buku = $1 FOR UPDATE',
        [item.id_buku]
      );

      if (checkStokRes.rows.length === 0) {
        throw new Error(`Buku dengan ID ${item.id_buku} tidak ditemukan`);
      }

      if (checkStokRes.rows[0].stok < item.jumlah) {
        throw new Error(`Stok buku ID ${item.id_buku} tidak mencukupi`);
      }

      await client.query(
        'INSERT INTO detail_peminjaman (id_pinjam, id_buku, jumlah) VALUES ($1, $2, $3)',
        [idPinjam, item.id_buku, item.jumlah]
      );

      await client.query(
        'UPDATE buku SET stok = stok - $1 WHERE id_buku = $2',
        [item.jumlah, item.id_buku]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({
      success: true,
      message: 'Transaksi peminjaman berhasil dicatat',
      id_pinjam: idPinjam,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};
