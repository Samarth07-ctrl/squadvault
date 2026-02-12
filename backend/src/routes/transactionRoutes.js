const express = require('express');
const router = express.Router();
const { recordTransaction, getPoolTransactions } = require('../controllers/transactionController');

router.post('/', recordTransaction);
router.get('/:poolId', getPoolTransactions);

module.exports = router;
