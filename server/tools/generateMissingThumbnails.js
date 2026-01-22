/* eslint-disable no-console */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');
const { spawn } = require('child_process');
const { connectDB } = require('../db');
const Media = require('../models/Media');

let ffmpegPath = null;
try {
  // eslint-disable-next-line global-require
  ffmpegPath = require('ffmpeg-static');
} catch {
  ffmpegPath = null;
}

const uploadsDir = path.join(__dirname, '../uploads');

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

const generateThumbnailFromVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      return reject(new Error('ffmpeg is not available. Install with: npm i ffmpeg-static'));
    }

    const args = [
      '-y',
      '-ss', '00:00:00.500',
      '-i', inputPath,
      '-frames:v', '1',
      '-vf', 'scale=640:-2',
      '-q:v', '3',
      outputPath,
    ];

    const child = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';

    const timeoutMs = Number.parseInt(process.env.THUMBNAIL_TIMEOUT_MS || '60000', 10);
    const timeout = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch { /* ignore */ }
      reject(new Error(`ffmpeg (thumbnail) timed out after ${timeoutMs}ms`));
    }, Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 60000);

    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) return resolve();
      reject(new Error(`ffmpeg (thumbnail) failed (code ${code}). ${stderr.slice(-2000)}`));
    });
  });
};

const main = async () => {
  if (!ffmpegPath) {
    console.error('❌ ffmpeg-static is not installed. Run: npm i ffmpeg-static');
    process.exit(1);
  }

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  await connectDB();

  const limit = Number.parseInt(process.env.THUMB_LIMIT || '0', 10);
  const onlyId = process.env.THUMB_ONLY_ID;

  const query = {
    filePath: { $regex: /^\/uploads\// },
    $or: [{ thumbnail: { $exists: false } }, { thumbnail: '' }, { thumbnail: null }],
  };
  if (onlyId) query._id = onlyId;

  const items = await Media.find(query).sort({ createdAt: -1 });
  const list = limit > 0 ? items.slice(0, limit) : items;

  console.log(`🖼️ Found ${items.length} media items missing thumbnails; processing ${list.length}...`);

  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const media of list) {
    const currentFilename = media.filename || path.basename(media.filePath || '');
    if (!currentFilename) {
      skipped += 1;
      console.warn(`⚠️ Skip ${media._id}: missing filename/filePath`);
      continue;
    }

    const inputPath = findUploadPath(currentFilename);
    if (!inputPath) {
      skipped += 1;
      console.warn(`⚠️ Skip ${media._id}: file not found: ${currentFilename}`);
      continue;
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const thumbFilename = `thumb-${uniqueSuffix}.jpg`;
    const outputPath = path.join(uploadsDir, thumbFilename);

    try {
      process.stdout.write(`→ Thumbnail ${media._id} (${currentFilename}) ... `);
      await generateThumbnailFromVideo(inputPath, outputPath);
      media.thumbnail = `/uploads/${thumbFilename}`;
      await media.save();
      ok += 1;
      process.stdout.write('OK\n');
    } catch (e) {
      failed += 1;
      process.stdout.write(`FAILED (${e.message})\n`);
      try { if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath); } catch { /* ignore */ }
    }
  }

  console.log(`✅ Done. OK=${ok} Skipped=${skipped} Failed=${failed}`);
  process.exit(0);
};

main().catch((e) => {
  console.error('❌ Fatal:', e);
  process.exit(1);
});
