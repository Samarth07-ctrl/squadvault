const express = require('express');
const router = express.Router();
const { loginUser, getUserProfile } = require('../controllers/userController');

router.post('/login', loginUser);
router.get('/:walletAddress', getUserProfile);

module.exports = router;
