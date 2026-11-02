# Perpustakaan API (Express.js + PostgreSQL)

REST API modular menggunakan Express.js dan PostgreSQL native driver (`pg`) yang terintegrasi dengan schema `perpustakaan`.

## Prasyarat
1. Node.js (v18+)
2. PostgreSQL (sudah menjalankan DDL schema `perpustakaan`)

## Cara Instalasi & Menjalankan

1. Salin `.env.example` menjadi `.env` lalu sesuaikan konfigurasi database:
   ```bash
   cp .env.example .env
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Jalankan server:
   - Mode Development:
     ```bash
     npm run dev
     ```
   - Mode Production:
     ```bash
     npm start
     ```

## Endpoint API

### Buku (`/api/buku`)
- `GET /api/buku` - Daftar semua buku beserta relasi kategori & penerbit
- `GET /api/buku/:id` - Detail buku berdasarkan ID
- `POST /api/buku` - Tambah buku baru
- `PUT /api/buku/:id` - Perbarui buku
- `DELETE /api/buku/:id` - Hapus buku

### Peminjaman (`/api/peminjaman`)
- `POST /api/peminjaman` - Buat transaksi peminjaman (mengurangi stok otomatis via DB transaction)

### Pengembalian (`/api/pengembalian`)
- `POST /api/pengembalian` - Catat pengembalian buku, kembalikan stok, dan hitung denda keterlambatan otomatis
