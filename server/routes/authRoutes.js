// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();

// Simple auth routes for now
router.post('/register', (req, res) => {
  res.json({
    success: true,
    message: 'Register endpoint - implement later',
    token: 'dummy-token-for-development'
  });
});

router.post('/login', (req, res) => {
  res.json({
    success: true,
    message: 'Login endpoint - implement later',
    token: 'dummy-token-for-development',
    user: {
      id: 'user-id',
      username: 'testuser',
      email: 'test@example.com'
    }
  });
});

module.exports = router;