// server/server.js - ULTRA SIMPLE VERSION
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Connect to MongoDB
const connectDB = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    
    // Check if .env is loaded
    console.log('Checking environment...');
    console.log('PORT:', process.env.PORT);
    console.log('MONGODB_URI exists:', process.env.MONGODB_URI ? '✅ Yes' : '❌ No');
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ ERROR: MONGODB_URI is not defined in .env file');
      console.log('💡 Please create a .env file with:');
      console.log('MONGODB_URI=mongodb+srv://mailkmuzami13889_db_user:YOUR_PASSWORD@cluster0.sawpij.mongodb.net/mediastream?retryWrites=true&w=majority&appName=cluster0');
      console.log('PORT=5000');
      process.exit(1);
    }
    
    // Show masked URI (for security)
    const maskedURI = process.env.MONGODB_URI.replace(/\/\/(.*?)@/, '//***:***@');
    console.log('🔗 Connection string:', maskedURI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Atlas Connected Successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check your password in .env file');
    console.log('2. Make sure MongoDB Atlas cluster is running');
    console.log('3. Check internet connection');
    console.log('4. Go to MongoDB Atlas → Network Access → Add IP Address');
    console.log('5. Click "Allow Access from Anywhere" (for testing)');
    process.exit(1);
  }
};

// Then modify the startServer function:
const startServer = async () => {
  await connectDB();  // Wait for DB connection
  
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(40));
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/health`);
    console.log('='.repeat(40) + '\n');
  });
};
// Import routes
const mediaRoutes = require('./routes/mediaRoutes');
const authRoutes = require('./routes/authRoutes');

// Use routes
app.use('/api/media', mediaRoutes);
app.use('/api/auth', authRoutes);

// Basic routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'MediaStream API',
    version: '1.0.0',
    endpoints: {
      media: '/api/media',
      auth: '/api/auth',
      uploads: '/uploads'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(40));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log('='.repeat(40) + '\n');
});