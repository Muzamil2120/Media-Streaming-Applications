const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mock user data (replace with MongoDB models)
let users = [];
let media = [];

// Auth Routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = {
      id: users.length + 1,
      name,
      email,
      password: hashedPassword
    };

    users.push(user);

    // Generate token
    const token = jwt.sign(
      { email: user.email, id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const existingUser = users.find(user => user.email === email);
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: { 
        id: existingUser.id, 
        name: existingUser.name, 
        email: existingUser.email 
      }
    });

  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Media Routes
app.get('/api/media', (req, res) => {
  res.json(media);
});

app.post('/api/media', (req, res) => {
  const newMedia = {
    id: media.length + 1,
    ...req.body,
    uploadDate: new Date().toISOString(),
    views: 0
  };
  media.push(newMedia);
  res.status(201).json(newMedia);
});

app.put('/api/media/:id', (req, res) => {
  const mediaIndex = media.findIndex(m => m.id === parseInt(req.params.id));
  if (mediaIndex === -1) {
    return res.status(404).json({ message: 'Media not found' });
  }
  media[mediaIndex] = { ...media[mediaIndex], ...req.body };
  res.json(media[mediaIndex]);
});

app.delete('/api/media/:id', (req, res) => {
  const mediaIndex = media.findIndex(m => m.id === parseInt(req.params.id));
  if (mediaIndex === -1) {
    return res.status(404).json({ message: 'Media not found' });
  }
  media.splice(mediaIndex, 1);
  res.json({ message: 'Media deleted successfully' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'MERN Mediastream API',
    timestamp: new Date().toISOString(),
    users: users.length,
    media: media.length
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'MERN Mediastream Backend API',
    version: '1.0.0',
    endpoints: {
      auth: ['/api/auth/signup', '/api/auth/signin'],
      media: '/api/media',
      health: '/api/health'
    }
  });
});

// Start Server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log('🎬 MERN Mediastream Server Started!');
  console.log(`📡 API Running: http://localhost:${PORT}`);
  console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🎥 Media Endpoint: http://localhost:${PORT}/api/media`);
  console.log(`⏰ Started: ${new Date().toLocaleString()}`);
});