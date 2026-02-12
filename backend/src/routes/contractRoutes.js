const express = require('express');
const router = express.Router();
const { getContractParams } = require('../controllers/contractController');

router.get('/params', getContractParams);

module.exports = router;
