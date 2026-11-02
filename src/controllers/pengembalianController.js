const { pool } = require('../config/db');

// POST: Catat pengembalian buku, kembalikan stok, dan hitung denda otomatis
exports.createPengembalian = async (req, res) => {
  const { id_pinjam, id_staf, tanggal_kembali } = req.body;

  if (!id_pinjam || !id_staf) {
    return res.status(400).json({ success: false, message: 'id_pinjam dan id_staf wajib diisi' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Cek data peminjaman
    const pinjamRes = await client.query(
      'SELECT id_pinjam, tanggal_pinjam FROM peminjaman WHERE id_pinjam = $1 FOR UPDATE',
      [id_pinjam]
    );

    if (pinjamRes.rows.length === 0) {
      throw new Error(`Transaksi peminjaman ID ${id_pinjam} tidak ditemukan`);
    }

    // 2. Cek apakah transaksi peminjaman sudah pernah dikembalikan
    const cekKembaliRes = await client.query(
      'SELECT id_kembali FROM pengembalian WHERE id_pinjam = $1',
      [id_pinjam]
    );
    if (cekKembaliRes.rows.length > 0) {
      throw new Error(`Peminjaman ID ${id_pinjam} sudah pernah diproses pengembaliannya`);
    }

    const tglPinjam = new Date(pinjamRes.rows[0].tanggal_pinjam);
    const tglKembali = tanggal_kembali ? new Date(tanggal_kembali) : new Date();

    // Hitung selisih hari peminjaman
    const diffTime = tglKembali.getTime() - tglPinjam.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Aturan batas pinjam (misal: 7 hari). Keterlambatan dikenakan denda Rp 1.000 / hari
    const MAX_HARI_PINJAM = 7;
    const TARIF_DENDA_PER_HARI = 1000;
    let denda = 0;

    if (diffDays > MAX_HARI_PINJAM) {
      const terlambatHari = diffDays - MAX_HARI_PINJAM;
      denda = terlambatHari * TARIF_DENDA_PER_HARI;
    }

    // 3. Catat entri ke tabel pengembalian
    const insertKembaliQuery = `
      INSERT INTO pengembalian (id_pinjam, tanggal_kembali, denda, id_staf)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const kembaliRes = await client.query(insertKembaliQuery, [
      id_pinjam,
      tglKembali,
      denda,
      id_staf,
    ]);

    // 4. Kembalikan stok buku sesuai detail_peminjaman
    const detailRes = await client.query(
      'SELECT id_buku, jumlah FROM detail_peminjaman WHERE id_pinjam = $1',
      [id_pinjam]
    );

    for (const item of detailRes.rows) {
      await client.query(
        'UPDATE buku SET stok = stok + $1 WHERE id_buku = $2',
        [item.jumlah, item.id_buku]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Buku berhasil dikembalikan dan stok telah disesuaikan',
      data: {
        ...kembaliRes.rows[0],
        total_hari_pinjam: diffDays,
        status_keterlambatan: diffDays > MAX_HARI_PINJAM ? `Terlambat ${diffDays - MAX_HARI_PINJAM} hari` : 'Tepat waktu',
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(400).json({ success: false, message: error.message });
  } finally {
    client.release();
  }
};
