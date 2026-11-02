const db = require('../config/db');

// GET: Ambil semua buku beserta detail kategori & penerbit
exports.getAllBuku = async (req, res) => {
  try {
    const query = `
      SELECT 
        b.id_buku,
        b.judul,
        b.tahun_terbit,
        b.stok,
        k.nama_kategori,
        p.nama_penerbit,
        p.kota AS kota_penerbit
      FROM buku b
      LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
      LEFT JOIN penerbit p ON b.id_penerbit = p.id_penerbit
      ORDER BY b.id_buku ASC;
    `;
    const { rows } = await db.query(query);
    res.status(200).json({ success: true, total: rows.length, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET: Ambil buku berdasarkan ID
exports.getBukuById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT b.*, k.nama_kategori, p.nama_penerbit 
      FROM buku b
      LEFT JOIN kategori k ON b.id_kategori = k.id_kategori
      LEFT JOIN penerbit p ON b.id_penerbit = p.id_penerbit
      WHERE b.id_buku = $1;
    `;
    const { rows } = await db.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    }
    res.status(200).json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST: Tambah buku baru
exports.createBuku = async (req, res) => {
  const { judul, id_kategori, id_penerbit, tahun_terbit, stok } = req.body;

  if (!judul) {
    return res.status(400).json({ success: false, message: 'Judul buku wajib diisi' });
  }

  try {
    const query = `
      INSERT INTO buku (judul, id_kategori, id_penerbit, tahun_terbit, stok)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const values = [judul, id_kategori, id_penerbit, tahun_terbit, stok || 0];
    const { rows } = await db.query(query, values);

    res.status(201).json({ success: true, message: 'Buku berhasil ditambahkan', data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT: Perbarui data buku
exports.updateBuku = async (req, res) => {
  const { id } = req.params;
  const { judul, id_kategori, id_penerbit, tahun_terbit, stok } = req.body;

  try {
    const query = `
      UPDATE buku
      SET judul = $1, id_kategori = $2, id_penerbit = $3, tahun_terbit = $4, stok = $5
      WHERE id_buku = $6
      RETURNING *;
    `;
    const values = [judul, id_kategori, id_penerbit, tahun_terbit, stok, id];
    const { rows } = await db.query(query, values);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    }

    res.status(200).json({ success: true, message: 'Buku berhasil diperbarui', data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE: Hapus buku
exports.deleteBuku = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM buku WHERE id_buku = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
    }
    res.status(200).json({ success: true, message: 'Buku berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
