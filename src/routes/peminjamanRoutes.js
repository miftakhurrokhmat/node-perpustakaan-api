const express = require('express');
const router = express.Router();
const peminjamanController = require('../controllers/peminjamanController');

router.post('/', peminjamanController.createPeminjaman);

module.exports = router;
