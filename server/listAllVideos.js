const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017';

console.log('Connecting to:', mongoURI);

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  
  // Check 'test' database (default)
  console.log('\nChecking default database...');
  const MediaSchema = new mongoose.Schema({}, { strict: false }); // Use strict: false to see all fields
  const Media = mongoose.model('Media', MediaSchema);
  const videos = await Media.find({});
  console.log(`Found ${videos.length} videos in default DB:`);
  videos.forEach(v => console.log(JSON.stringify(v, null, 2)));

  process.exit(0);
})
.catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
