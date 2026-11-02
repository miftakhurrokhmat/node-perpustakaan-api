CREATE SCHEMA IF NOT EXISTS perpustakaan;
SET search_path TO perpustakaan;

-- Kategori
CREATE TABLE IF NOT EXISTS kategori (
    id_kategori SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL
);

-- Penerbit
CREATE TABLE IF NOT EXISTS penerbit (
    id_penerbit SERIAL PRIMARY KEY,
    nama_penerbit VARCHAR(100) NOT NULL,
    kota VARCHAR(100)
);

-- Buku
CREATE TABLE IF NOT EXISTS buku (
    id_buku SERIAL PRIMARY KEY,
    judul VARCHAR(200) NOT NULL,
    id_kategori INT REFERENCES kategori(id_kategori),
    id_penerbit INT REFERENCES penerbit(id_penerbit),
    tahun_terbit INT,
    stok INT DEFAULT 0 CHECK (stok >= 0)
);

-- Anggota
CREATE TABLE IF NOT EXISTS anggota (
    id_anggota SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    alamat VARCHAR(200),
    no_hp VARCHAR(15)
);

-- Staf
CREATE TABLE IF NOT EXISTS staf (
    id_staf SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    jabatan VARCHAR(100)
);

-- Peminjaman
CREATE TABLE IF NOT EXISTS peminjaman (
    id_pinjam SERIAL PRIMARY KEY,
    id_anggota INT REFERENCES anggota(id_anggota),
    id_staf INT REFERENCES staf(id_staf),
    tanggal_pinjam DATE DEFAULT CURRENT_DATE
);

-- Detail Peminjaman
CREATE TABLE IF NOT EXISTS detail_peminjaman (
    id_detail SERIAL PRIMARY KEY,
    id_pinjam INT REFERENCES peminjaman(id_pinjam) ON DELETE CASCADE,
    id_buku INT REFERENCES buku(id_buku),
    jumlah INT NOT NULL CHECK (jumlah > 0)
);

-- Pengembalian
CREATE TABLE IF NOT EXISTS pengembalian (
    id_kembali SERIAL PRIMARY KEY,
    id_pinjam INT REFERENCES peminjaman(id_pinjam),
    tanggal_kembali DATE DEFAULT CURRENT_DATE,
    denda NUMERIC(10,2) DEFAULT 0,
    id_staf INT REFERENCES staf(id_staf)
);
