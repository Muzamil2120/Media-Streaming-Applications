const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../../config/config');
const auth = require('../middleware/auth');

// Register route
router.post('/register', async (req, res) => {
  console.log('🔥 REGISTRATION REQUEST RECEIVED');
  console.log('Request body:', req.body);
  
  try {
    const username = typeof req.body.username === 'string' ? req.body.username.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    
    // Validate input
    const missing = [];
    if (!username) missing.push('username');
    if (!email) missing.push('email');
    if (!password) missing.push('password');
    if (missing.length) {
      console.log('❌ Missing required fields:', missing);
      return res.status(400).json({ message: 'All fields are required', missing });
    }
    
    console.log('🔍 Checking for existing user...');
    const existingUser = await User.findOne({ email });
    console.log('Existing user found:', existingUser);
    
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ message: 'User already exists' });
    }
    
    console.log('👤 Creating new user...');
    const newUser = new User({ username, email, password });
    console.log('New user object:', newUser);
    
    console.log('💾 Saving to database...');
    const savedUser = await newUser.save();
    console.log('✅ User saved successfully:', savedUser);
    
    // Create JWT token
    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    
    res.status(201).json({ 
      message: 'User registered successfully',
      token,
      user: {
        id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email
      }
    });
  } catch (error) {
    console.error('❌ REGISTRATION ERROR:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Signin route
router.post('/signin', async (req, res) => {
  console.log('🔐 SIGNIN REQUEST RECEIVED');
  console.log('Request body:', req.body);
  
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    console.log('🔍 Finding user...');
    const user = await User.findOne({ email });
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('🔑 Comparing passwords using User model method...');
    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Password does not match');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    console.log('✅ Authentication successful');
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username },
      config.jwtSecret,
      { expiresIn: '1h' }
    );
    
    res.json({
      message: 'Signin successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ SIGNIN ERROR:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Get user profile
router.get('/me', async (req, res) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // Find user by ID
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('❌ GET PROFILE ERROR:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
});

// Update profile (name, bio, avatar URL, optional password change)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, bio, avatar, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (typeof name === 'string') user.name = name;
    if (typeof bio === 'string') user.bio = bio;
    if (typeof avatar === 'string') user.avatar = avatar;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required to set new password' });
      }
      const match = await user.comparePassword(currentPassword);
      if (!match) return res.status(401).json({ message: 'Current password incorrect' });
      user.password = newPassword; // will hash via pre-save
    }

    await user.save();
    const safeUser = {
      id: user._id,
      username: user.username,
      email: user.email,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
    };
    res.json({ message: 'Profile updated', user: safeUser });
  } catch (error) {
    console.error('❌ UPDATE PROFILE ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;