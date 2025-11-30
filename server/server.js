const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'MERN Mediastream API',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected successfully');
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Start Server
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log('🎬 MERN Mediastream Server Started!');
    console.log(`📡 API Running: http://localhost:${PORT}`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
    console.log(`🎥 Media API: http://localhost:${PORT}/api/media`);
    console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
    console.log(`⏰ Started: ${new Date().toLocaleString()}`);
  });
};

startServer();