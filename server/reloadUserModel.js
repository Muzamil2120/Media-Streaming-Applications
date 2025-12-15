const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const reloadUserModel = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
    
    // Get all users
    const users = await User.find();
    console.log(`🔍 Found ${users.length} users`);
    
    for (const user of users) {
      console.log(`\n👤 Processing user: ${user.email}`);
      
      // Check if password is already hashed
      if (user.password.length < 60) {
        console.log(`🔐 Hashing password for user: ${user.email}`);
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(user.password, salt);
        
        // Update the user document
        await User.updateOne(
          { _id: user._id },
          { 
            $set: { 
              password: hashedPassword,
              // Add any missing fields from your schema
              username: user.username || user.name || 'User'
            }
          }
        );
        
        console.log(`✅ User updated: ${user.email}`);
      } else {
        console.log(`✅ Password already hashed for user: ${user.email}`);
      }
    }
    
    // Now let's verify the model has the method
    console.log('\n🔍 Verifying User model...');
    const testUser = new User({ 
      username: 'test', 
      email: 'test@example.com', 
      password: 'password123' 
    });
    
    if (typeof testUser.comparePassword === 'function') {
      console.log('✅ comparePassword method exists in User model');
    } else {
      console.log('❌ comparePassword method missing from User model');
    }
    
    console.log('\n🎉 User model verification complete');
    
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
reloadUserModel();