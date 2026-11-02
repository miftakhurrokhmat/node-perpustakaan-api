const express = require('express');
const router = express.Router();
const bukuController = require('../controllers/bukuController');

router.get('/', bukuController.getAllBuku);
router.get('/:id', bukuController.getBukuById);
router.post('/', bukuController.createBuku);
router.put('/:id', bukuController.updateBuku);
router.delete('/:id', bukuController.deleteBuku);

module.exports = router;
