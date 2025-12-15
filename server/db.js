const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables

// Get MongoDB URI with fallback to local
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

module.exports = { connectDB, mongoose };