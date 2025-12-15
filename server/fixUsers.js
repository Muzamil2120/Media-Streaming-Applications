// Create fixUsers.js in your server directory
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const fixUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    
    // Get all users
    const users = await User.find();
    console.log(`Found ${users.length} users`);
    
    // Update each user with hashed password
    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes are typically 60 chars)
      if (user.password.length < 60) {
        console.log(`Updating password for user: ${user.email}`);
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        console.log(`Password updated for user: ${user.email}`);
      } else {
        console.log(`Password already hashed for user: ${user.email}`);
      }
    }
    
    console.log('All users updated successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

fixUsers();