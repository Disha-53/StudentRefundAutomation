const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { list } = require('../controllers/notificationController');

const router = express.Router();

router.get('/', authenticate, list);

module.exports = router;

