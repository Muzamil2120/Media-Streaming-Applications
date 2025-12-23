require('dotenv').config(); // MUST BE FIRST LINE

const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, mongoose } = require('./db');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5002'], // Updated to match your backend port
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
// Serve uploaded media. Historically, uploads may exist in either:
// - server/uploads (current)
// - <repoRoot>/uploads (legacy)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/media', require('./routes/mediaRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'MERN Mediastream API',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Debug endpoint
app.get('/api/debug-db', async (req, res) => {
  try {
    const db = mongoose.connection;
    const status = {
      readyState: db.readyState,
      name: db.name,
      host: db.host,
      port: db.port,
      user: db.user
    };
    
    // List all collections
    const collections = await db.db.listCollections().toArray();
    
    // Try to insert a test document
    const testCollection = db.db.collection('debug_test');
    const testDoc = { test: true, timestamp: new Date() };
    const insertResult = await testCollection.insertOne(testDoc);
    
    res.json({
      connection: status,
      collections: collections.map(c => c.name),
      testInsert: {
        success: true,
        insertedId: insertResult.insertedId
      }
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: err.message, code: err.code });
  }
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

// Start Server
const PORT = process.env.PORT || 5002; // Changed default to 5002

const startServer = async () => {
  try {
    await connectDB(); // Connect to MongoDB first
    
    app.listen(PORT, () => {
      console.log('🎬 MERN Mediastream Server Started!');
      console.log(`📡 API Running: http://localhost:${PORT}`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(`🎥 Media API: http://localhost:${PORT}/api/media`);
      console.log(`📁 Uploads: http://localhost:${PORT}/uploads`);
      console.log(`⏰ Started: ${new Date().toLocaleString()}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();