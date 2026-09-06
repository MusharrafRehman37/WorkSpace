const express = require('express');
const { getAllUsers } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/users', protect, adminOnly, getAllUsers);

module.exports = router;