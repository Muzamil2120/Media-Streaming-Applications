const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const fixExistingUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Find all users
    const users = await User.find();
    console.log(`🔍 Found ${users.length} users`);
    
    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.email}`);
      
      // Check if password is already hashed (bcrypt hashes are typically 60 chars)
      if (user.password.length < 60) {
        console.log(`🔐 Hashing password for user: ${user.email}`);
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        // Update the user with the hashed password
        await User.updateOne(
          { _id: user._id },
          { $set: { password: hashedPassword } }
        );
        
        console.log(`✅ Password updated for user: ${user.email}`);
      } else {
        console.log(`✅ Password already hashed for user: ${user.email}`);
      }
    }
    
    console.log('\n🎉 All users have been processed successfully');
    
    // Close the database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    
    // Exit the process
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the function
fixExistingUsers();