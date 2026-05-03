// backend/routes/requestRoutes.js
const express = require('express');
const { getAllRequests, updateRequestStatus } = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getAllRequests);
router.put('/:id/status', authMiddleware, updateRequestStatus); // NEW: for status update

module.exports = router;