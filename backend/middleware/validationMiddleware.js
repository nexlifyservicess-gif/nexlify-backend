// backend/middleware/validationMiddleware.js
const { body, validationResult } = require('express-validator');

exports.validateLogin = [
  // Comment out or remove these rules temporarily to test if validation is the blocker
  // body('email').isEmail().withMessage('Invalid email'),
  // body('password').isLength({ min: 8 }).withMessage('Password too short'),

  // Keep only the sanitizer (trim) — or remove the whole array for testing
  body('email').trim().normalizeEmail(),
  body('password').trim(),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('VALIDATION ERRORS:', errors.array());
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];