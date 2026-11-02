const express = require('express');
require('dotenv').config();

const bukuRoutes = require('./routes/bukuRoutes');
const peminjamanRoutes = require('./routes/peminjamanRoutes');
const pengembalianRoutes = require('./routes/pengembalianRoutes');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/buku', bukuRoutes);
app.use('/api/peminjaman', peminjamanRoutes);
app.use('/api/pengembalian', pengembalianRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Perpustakaan API berjalan aktif',
    endpoints: {
      buku: '/api/buku',
      peminjaman: '/api/peminjaman',
      pengembalian: '/api/pengembalian',
    },
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server aktif di http://localhost:${PORT}`);
});
