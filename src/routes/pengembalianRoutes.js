const express = require('express');
const router = express.Router();
const pengembalianController = require('../controllers/pengembalianController');

router.post('/', pengembalianController.createPengembalian);

module.exports = router;
