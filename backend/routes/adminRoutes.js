// backend/routes/adminRoutes.js
const express = require('express');
const { login, refreshToken, logout } = require('../controllers/adminController');
const { validateLogin } = require('../middleware/validationMiddleware');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.post('/login', validateLogin, login);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});
router.post('/logout', authMiddleware, logout);

module.exports = router;