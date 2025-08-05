const express = require('express');
const passport = require('passport');
const { signup, login, logout, getUser } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Local auth
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout',authMiddleware, logout);
router.get('/me', authMiddleware, getUser);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', {
    successRedirect: 'http://localhost:5173/dashboard',
    failureRedirect: 'http://localhost:5173/login',
  })
);

module.exports = router;
