const express = require('express');
const router = express.Router();
const { createPool, getPools, joinPool } = require('../controllers/poolController');

router.post('/create', createPool);
router.get('/', getPools);
router.post('/join', joinPool);

module.exports = router;
