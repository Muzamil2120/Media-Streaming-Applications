const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { connectDB, mongoose } = require('./db');

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (no Origin header)
      if (!origin) return callback(null, true);

      // In development, allow LAN origins so the app works via IP (e.g. phone testing)
      // without constantly updating allowlists.
      if ((process.env.NODE_ENV || 'development') !== 'production') {
        const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
        const isPrivateIp =
          /^https?:\/\/(10\.\d{1,3}\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3})(:\d+)?$/i.test(
            origin
          );
        if (isLocalhost || isPrivateIp) return callback(null, true);
      }

      // Allow explicitly configured origins
      if (allowedOrigins.includes(origin)) return callback(null, true);

      // Allow custom origin via env (comma-separated)
      const extra = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (extra.includes(origin)) return callback(null, true);

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Helper: find an uploaded file by name in either supported uploads directory
const findUploadPath = (filename) => {
  const candidates = [
    path.join(__dirname, 'uploads', filename),
    path.join(__dirname, '../uploads', filename),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

// Helper: minimal content-type mapping (keeps dependencies small)
const contentTypeFor = (filename) => {
  const ext = path.extname(filename || '').toLowerCase();
  switch (ext) {
    case '.mp4':
    case '.m4v':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.mov':
      return 'video/quicktime';
    case '.ogv':
    case '.ogg':
      return 'video/ogg';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.webp':
      return 'image/webp';
    case '.gif':
      return 'image/gif';
    default:
      return 'application/octet-stream';
  }
};

// Stream uploads with Range support (important for reliable video playback)
app.get('/uploads/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const fullPath = findUploadPath(filename);
    if (!fullPath) return res.status(404).end('Not found');

    const stat = fs.statSync(fullPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const contentType = contentTypeFor(filename);

    // Always advertise that we support ranges
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', contentType);

    if (!range) {
      res.setHeader('Content-Length', fileSize);
      fs.createReadStream(fullPath).pipe(res);
      return;
    }

    // Example: "bytes=0-1023"
    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end();
      return;
    }

    const start = match[1] ? parseInt(match[1], 10) : 0;
    const end = match[2] ? parseInt(match[2], 10) : Math.min(start + 1024 * 1024 - 1, fileSize - 1);

    if (Number.isNaN(start) || Number.isNaN(end) || start >= fileSize || end >= fileSize || start > end) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`).end();
      return;
    }

    const chunkSize = end - start + 1;
    res.status(206);
    res.setHeader('Content-Length', chunkSize);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    fs.createReadStream(fullPath, { start, end }).pipe(res);
  } catch (err) {
    console.error('❌ Upload stream error:', err);
    res.status(500).end('Server error');
  }
});

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