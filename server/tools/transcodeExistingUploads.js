/* eslint-disable no-console */
require('dotenv').config();

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const { connectDB, mongoose } = require('../db');
const Media = require('../models/Media');

let ffmpegPath = null;
try {
  // eslint-disable-next-line global-require
  ffmpegPath = require('ffmpeg-static');
} catch {
  ffmpegPath = null;
}

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

const uploadsDir = path.join(__dirname, '../uploads');

const isMp4Like = (name) => {
  const n = String(name || '').toLowerCase();
  return n.endsWith('.mp4') || n.endsWith('.m4v');
};

const remuxFaststart = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      return reject(new Error('ffmpeg is not available. Install with: npm i ffmpeg-static'));
    }

    const args = [
      '-y',
      '-i', inputPath,
      // Remux only (no re-encode) + make streamable
      '-c', 'copy',
      '-movflags', '+faststart',
      outputPath,
    ];

    const child = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';

    const timeoutMs = Number.parseInt(process.env.TRANSCODE_TIMEOUT_MS || '1800000', 10);
    const disableTimeout = String(process.env.TRANSCODE_DISABLE_TIMEOUT || '').toLowerCase() === 'true';
    const timeout = disableTimeout
      ? null
      : setTimeout(() => {
          try { child.kill('SIGKILL'); } catch { /* ignore */ }
          reject(new Error(`ffmpeg (faststart) timed out after ${timeoutMs}ms. args=${JSON.stringify(args)}`));
        }, Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 1800000);

    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    child.on('error', (err) => {
      if (timeout) clearTimeout(timeout);
      reject(err);
    });

    child.on('close', (code) => {
      if (timeout) clearTimeout(timeout);
      if (code === 0) return resolve();
      reject(new Error(`ffmpeg (faststart) failed (code ${code}). ${stderr.slice(-2000)}`));
    });
  });
};

const probeMediaInfo = (inputPath) => {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) return resolve('');
    const child = spawn(ffmpegPath, ['-hide_banner', '-i', inputPath], { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });
    child.on('error', reject);
    child.on('close', () => resolve(stderr));
  });
};

const seemsBrowserPlayable = (probeText, originalNameOrFilename) => {
  const name = String(originalNameOrFilename || '').toLowerCase();
  const isMp4ish = name.endsWith('.mp4') || name.endsWith('.m4v') || /\bmp4\b/i.test(probeText);
  const hasH264 = /Video:\s*h264/i.test(probeText);
  const hasHevc = /Video:\s*(hevc|h265)/i.test(probeText);
  const hasAac = /Audio:\s*aac/i.test(probeText);
  const hasNoAudio = /Stream #\d+:\d+\(.*\): Audio:/i.test(probeText) === false;
  if (hasHevc) return false;
  if (isMp4ish && hasH264 && (hasAac || hasNoAudio)) return true;
  return false;
};

const transcodeToH264Faststart = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      return reject(new Error('ffmpeg is not available. Install with: npm i ffmpeg-static'));
    }

    const preset = process.env.TRANSCODE_PRESET || 'ultrafast';
    const crf = process.env.TRANSCODE_CRF || '28';
    const audioBitrate = process.env.TRANSCODE_AUDIO_BITRATE || '128k';

    const args = [
      '-y',
      '-i', inputPath,
      '-map', '0:v:0',
      '-map', '0:a?',
      '-c:v', 'libx264',
      '-preset', preset,
      '-crf', String(crf),
      '-c:a', 'aac',
      '-b:a', String(audioBitrate),
      '-movflags', '+faststart',
      outputPath,
    ];

    // IMPORTANT: don't pipe stdout unless you fully drain it; otherwise ffmpeg can deadlock.
    const child = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';

    const timeoutMsRaw = process.env.TRANSCODE_TIMEOUT_MS;
    const timeoutMs = Number.parseInt(timeoutMsRaw || '1800000', 10); // 30 min default
    const disableTimeout = String(process.env.TRANSCODE_DISABLE_TIMEOUT || '').toLowerCase() === 'true';

    const timeout = disableTimeout
      ? null
      : setTimeout(() => {
          try {
            child.kill('SIGKILL');
          } catch {
            // ignore
          }
          reject(new Error(`ffmpeg timed out after ${timeoutMs}ms. args=${JSON.stringify(args)}`));
        }, Number.isFinite(timeoutMs) && timeoutMs > 0 ? timeoutMs : 1800000);

    child.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    child.on('error', (err) => {
      if (timeout) clearTimeout(timeout);
      reject(err);
    });
    child.on('close', (code) => {
      if (timeout) clearTimeout(timeout);
      if (code === 0) return resolve();
      reject(new Error(`ffmpeg failed (code ${code}). ${stderr.slice(-2000)}`));
    });
  });
};

const main = async () => {
  if (!ffmpegPath) {
    console.error('❌ ffmpeg-static is not installed in server/.');
    console.error('Run: cd server && npm i ffmpeg-static');
    process.exit(1);
  }

  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

  await connectDB();

  const limit = Number.parseInt(process.env.TRANSCODE_LIMIT || '0', 10);
  const onlyId = process.env.TRANSCODE_ONLY_ID;
  const removeOriginal = process.env.TRANSCODE_REMOVE_ORIGINAL !== 'false';
  const forceTranscode = String(process.env.TRANSCODE_FORCE || '').toLowerCase() === 'true';

  const query = { filePath: { $regex: /^\/uploads\// } };
  if (onlyId) query._id = onlyId;

  const items = await Media.find(query).sort({ createdAt: -1 });
  const list = limit > 0 ? items.slice(0, limit) : items;

  console.log(`🎬 Found ${items.length} media items; processing ${list.length}...`);

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

    // If already browser playable, still ensure MP4 is "faststart" so duration loads immediately.
    // If TRANSCODE_FORCE=true, do a full transcode anyway (helps for stubborn files that still fail in browser).
    try {
      const info = await probeMediaInfo(inputPath);
      if (seemsBrowserPlayable(info, media.originalName || currentFilename)) {
        if (forceTranscode) {
          // fall through to full transcode path
        } else {
        if (isMp4Like(currentFilename)) {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const outputFilename = `video-${uniqueSuffix}.mp4`;
          const outputPath = path.join(uploadsDir, outputFilename);

          process.stdout.write(`→ Faststart remux ${media._id} (${currentFilename}) ... `);
          await remuxFaststart(inputPath, outputPath);

          const size = fs.statSync(outputPath).size;
          media.filename = outputFilename;
          media.filePath = `/uploads/${outputFilename}`;
          media.fileSize = size;
          await media.save();

          if (removeOriginal) {
            try { fs.unlinkSync(inputPath); } catch { /* ignore */ }
          }

          ok += 1;
          console.log('OK');
          continue;
        }

        skipped += 1;
        console.log(`↷ Skip ${media._id}: already playable (non-mp4 remux not applied)`);
        continue;
        }
      }
    } catch {
      // If probe fails, fall through and try transcoding.
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const outputFilename = `video-${uniqueSuffix}.mp4`;
    const outputPath = path.join(uploadsDir, outputFilename);

    process.stdout.write(`→ Transcoding ${media._id} (${currentFilename}) ... `);
    try {
      await transcodeToH264Faststart(inputPath, outputPath);
      const size = fs.statSync(outputPath).size;

      media.filename = outputFilename;
      media.filePath = `/uploads/${outputFilename}`;
      media.fileSize = size;
      await media.save();

      if (removeOriginal) {
        try {
          fs.unlinkSync(inputPath);
        } catch {
          // ignore
        }
      }

      ok += 1;
      console.log('OK');
    } catch (e) {
      failed += 1;
      console.log('FAIL');
      console.error(`   ${e.message}`);
      // Clean partial output
      try {
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      } catch {
        // ignore
      }
    }
  }

  console.log(`\n✅ Done. OK=${ok} Skipped=${skipped} Failed=${failed}`);
  await mongoose.disconnect();
};

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
