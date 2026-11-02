const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Set default schema ke perpustakaan setiap koneksi client aktif
pool.on('connect', (client) => {
  client.query('SET search_path TO perpustakaan, public');
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
