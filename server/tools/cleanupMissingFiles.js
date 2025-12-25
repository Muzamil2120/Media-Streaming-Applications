/* eslint-disable no-console */
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const { connectDB, mongoose } = require('../db');
const Media = require('../models/Media');

const findUploadPath = (filename) => {
  const candidates = [
    path.join(__dirname, '../uploads', filename),
    path.join(__dirname, '../../uploads', filename),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
};

const main = async () => {
  await connectDB();

  const dryRun = String(process.env.DRY_RUN || '').toLowerCase() === 'true';

  const allMedia = await Media.find({});
  console.log(`🔍 Found ${allMedia.length} media items. Checking for missing files...`);

  let missing = 0;
  let deleted = 0;
  let errors = 0;

  for (const media of allMedia) {
    const filename = media.filename || path.basename(media.filePath || '');
    if (!filename) {
      console.warn(`⚠️ Media ${media._id}: no filename/filePath`);
      errors += 1;
      continue;
    }

    const uploadPath = findUploadPath(filename);
    if (!uploadPath) {
      missing += 1;
      console.log(`❌ Missing: ${media._id} (${filename})`);

      if (!dryRun) {
        try {
          await Media.deleteOne({ _id: media._id });
          deleted += 1;
          console.log(`   → Deleted from DB`);
        } catch (e) {
          errors += 1;
          console.error(`   → Error deleting: ${e.message}`);
        }
      }
    }
  }

  console.log(`\n✅ Cleanup complete.`);
  console.log(`   Missing files: ${missing}`);
  console.log(`   Deleted from DB: ${deleted}`);
  console.log(`   Errors: ${errors}`);
  if (dryRun) {
    console.log(`   (DRY RUN—no changes made; run with DRY_RUN=false to delete)`);
  }

  await mongoose.disconnect();
};

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
