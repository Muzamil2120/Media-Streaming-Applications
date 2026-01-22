const express = require('express');
const Media = require('../models/Media');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const auth = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');
const router = express.Router();

let ffmpegPath = null;
try {
  // Optional dependency; if missing, uploads still work but may not be browser-playable
  // for some phone codecs (e.g., HEVC).
  // eslint-disable-next-line global-require
  ffmpegPath = require('ffmpeg-static');
} catch (e) {
  ffmpegPath = null;
}

const transcodeToH264Faststart = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      return reject(new Error('ffmpeg is not available (ffmpeg-static not installed)'));
    }

    const preset = process.env.TRANSCODE_PRESET || 'ultrafast';
    const crf = process.env.TRANSCODE_CRF || '28';
    const audioBitrate = process.env.TRANSCODE_AUDIO_BITRATE || '128k';

    const args = [
      '-y',
      '-i', inputPath,
      // Map video and (optional) audio
      '-map', '0:v:0',
      '-map', '0:a?',
      // Video: H.264
      '-c:v', 'libx264',
      '-preset', preset,
      '-crf', String(crf),
      // Audio: AAC (only if present)
      '-c:a', 'aac',
      '-b:a', String(audioBitrate),
      // Place moov atom at the start for fast metadata loading
      '-movflags', '+faststart',
      outputPath,
    ];

    // IMPORTANT: don't pipe stdout unless you fully drain it; otherwise ffmpeg can deadlock.
    const child = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';

    const timeoutMs = Number.parseInt(process.env.TRANSCODE_TIMEOUT_MS || '1800000', 10); // 30 min default
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

const remuxFaststart = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      return reject(new Error('ffmpeg is not available (ffmpeg-static not installed)'));
    }

    const args = [
      '-y',
      '-i', inputPath,
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

const generateThumbnailFromVideo = (inputPath, outputPath) => {
  return new Promise((resolve, reject) => {
    if (!ffmpegPath) {
      return reject(new Error('ffmpeg is not available (ffmpeg-static not installed)'));
    }

    const args = [
      '-y',
      // Seek a little into the video for a nicer frame; if the video is very short ffmpeg will still try.
      '-ss', '00:00:00.500',
      '-i', inputPath,
      '-frames:v', '1',
      // Keep a reasonable size for UI.
      '-vf', 'scale=640:-2',
      // Quality (lower is better); good balance for thumbnails.
      '-q:v', '3',
      outputPath,
    ];

    const child = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';

    const timeoutMs = Number.parseInt(process.env.THUMBNAIL_TIMEOUT_MS || '60000', 10);
    const timeout = setTimeout(() => {
      try { child.kill('SIGKILL'); } catch { /* ignore */ }
      reject(new Error(`ffmpeg (thumbnail) timed out after ${timeoutMs}ms. args=${JSON.stringify(args)}`));
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

// Quick probe using ffmpeg itself (no ffprobe dependency).
// ffmpeg prints codec info then exits with non-zero because no output is specified.
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

  // If HEVC/H.265 detected, treat as not playable for most browsers.
  if (hasHevc) return false;
  // MP4 + H.264 is usually fine; audio may be missing or AAC.
  if (isMp4ish && hasH264 && (hasAac || hasNoAudio)) return true;
  return false;
};



// Get all media (public)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const media = await Media.find({ isPublic: true })
      .populate('uploader', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Media.countDocuments({ isPublic: true });

    res.json({
      media,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's media
router.get('/my-media', auth, async (req, res) => {
  try {
    const media = await Media.find({ uploader: req.user.id })
      .populate('uploader', 'name avatar')
      .sort({ createdAt: -1 });

    res.json({ media });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single media
router.get('/:id', async (req, res) => {
  try {
    // Avoid CastError -> 500 when the client requests external IDs (e.g. Dailymotion).
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ message: 'Media not found' });
    }

    const media = await Media.findById(req.params.id)
      .populate('uploader', 'name avatar');

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Increment views
    media.views += 1;
    await media.save();

    res.json({ media });
  } catch (error) {
    console.error('Get media error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Upload media
// In development you can set DEV_ALLOW_UPLOADS=true to bypass auth for easier local testing
const requireAuth = (req, res, next) => {
  if (process.env.DEV_ALLOW_UPLOADS === 'true') return next();
  return auth(req, res, next);
};

router.post('/upload', requireAuth, upload.fields([{ name: 'video', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, description, category, tags, isPublic } = req.body;

    const videoFile = req.files && req.files.video && req.files.video[0];
    const thumbFile = req.files && req.files.thumbnail && req.files.thumbnail[0];

    // Ensure uploader exists to avoid mongoose validation errors
    const uploaderId = req.user && req.user.id ? req.user.id : req.body.uploaderId;

    if (!videoFile) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!uploaderId) {
      return res.status(401).json({ message: 'Authentication required to upload' });
    }

    // Ensure browser-playable output like YouTube (H.264/AAC + faststart).
    // This improves compatibility for phone-recorded MP4 files (often HEVC).
    const uploadsDir = path.join(__dirname, '../uploads');
    const inputPath = path.join(uploadsDir, videoFile.filename);
    let finalFilename = videoFile.filename;
    let finalSize = videoFile.size;

    const shouldTranscode = process.env.DISABLE_TRANSCODE !== 'true';
    // Skip transcoding if it already looks browser-playable (saves a lot of time).
    let alreadyPlayable = false;
    if (shouldTranscode && ffmpegPath) {
      try {
        const info = await probeMediaInfo(inputPath);
        alreadyPlayable = seemsBrowserPlayable(info, videoFile.originalname || videoFile.filename);
      } catch {
        alreadyPlayable = false;
      }
    }

    const isMp4Like = String(videoFile.originalname || videoFile.filename || '').toLowerCase().match(/\.(mp4|m4v)$/);

    if (shouldTranscode && ffmpegPath && alreadyPlayable && isMp4Like) {
      // Ensure quick start (moov atom first) without re-encoding.
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const outputFilename = `video-${uniqueSuffix}.mp4`;
      const outputPath = path.join(uploadsDir, outputFilename);
      try {
        await remuxFaststart(inputPath, outputPath);
        finalFilename = outputFilename;
        finalSize = fs.statSync(outputPath).size;
        try { fs.unlinkSync(inputPath); } catch { /* ignore */ }
      } catch (e) {
        console.warn('⚠️ Faststart remux failed; keeping original upload:', e.message);
      }
    } else if (shouldTranscode && ffmpegPath && !alreadyPlayable) {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const outputFilename = `video-${uniqueSuffix}.mp4`;
      const outputPath = path.join(uploadsDir, outputFilename);

      try {
        await transcodeToH264Faststart(inputPath, outputPath);
        // Prefer the transcoded file for playback
        finalFilename = outputFilename;
        finalSize = fs.statSync(outputPath).size;
        // Remove original to save disk space
        try {
          fs.unlinkSync(inputPath);
        } catch (e) {
          // ignore
        }
      } catch (e) {
        console.warn('⚠️ Transcode failed; keeping original upload:', e.message);
        // Keep original file; client may still play if codecs are supported
      }
    }

    // If no thumbnail was uploaded, try to generate one from the final video.
    let thumbnailPath = thumbFile ? `/uploads/${thumbFile.filename}` : '';
    if (!thumbnailPath && ffmpegPath) {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const thumbFilename = `thumb-${uniqueSuffix}.jpg`;
      const finalVideoPath = path.join(uploadsDir, finalFilename);
      const thumbOutputPath = path.join(uploadsDir, thumbFilename);
      try {
        await generateThumbnailFromVideo(finalVideoPath, thumbOutputPath);
        thumbnailPath = `/uploads/${thumbFilename}`;
      } catch (e) {
        console.warn('⚠️ Thumbnail generation failed; continuing without thumbnail:', e.message);
      }
    }

    const media = new Media({
      title,
      description,
      filename: finalFilename,
      originalName: videoFile.originalname,
      filePath: `/uploads/${finalFilename}`,
      fileSize: finalSize,
      thumbnail: thumbnailPath,
      category: category || 'Other',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isPublic: isPublic !== 'false',
      uploader: uploaderId
    });

    await media.save();
    await media.populate('uploader', 'name avatar');

    res.status(201).json({ 
      message: 'Media uploaded successfully', 
      media 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Update media
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, category, tags, isPublic } = req.body;

    const media = await Media.findOne({ 
      _id: req.params.id, 
      uploader: req.user.id 
    });

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    media.title = title;
    media.description = description;
    media.category = category;
    media.tags = tags ? tags.split(',').map(tag => tag.trim()) : [];
    media.isPublic = isPublic !== 'false';

    await media.save();
    await media.populate('uploader', 'name avatar');

    res.json({ message: 'Media updated successfully', media });
  } catch (error) {
    res.status(500).json({ message: 'Update failed' });
  }
});

// Delete media
router.delete('/:id', auth, async (req, res) => {
  try {
    const media = await Media.findOne({ 
      _id: req.params.id, 
      uploader: req.user.id 
    });

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Delete file from filesystem (optional)
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '../uploads', media.filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Media.findByIdAndDelete(req.params.id);

    res.json({ message: 'Media deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Delete failed' });
  }
});

// Search media
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const media = await Media.find({
      isPublic: true,
      $text: { $search: query }
    })
    .populate('uploader', 'name avatar')
    .sort({ createdAt: -1 });

    res.json({ media });
  } catch (error) {
    res.status(500).json({ message: 'Search failed' });
  }
});


// Get trending media
router.get('/trending/all', async (req, res) => {
  try {
    console.log('🔍 Fetching trending media');
    const now = new Date();

    const trendingMedia = await Media.aggregate([
      {
        $addFields: {
          commentsCount: { $size: { $ifNull: ['$comments', []] } },
          ageDays: {
            $divide: [
              { $subtract: [now, '$createdAt'] },
              1000 * 60 * 60 * 24
            ]
          }
        }
      },
      {
        $addFields: {
          recencyScore: {
            $max: [0, { $subtract: [1, { $divide: ['$ageDays', 14] }] }]
          },
          trendingScore: {
            $add: [
              { $multiply: ['$views', 0.6] },
              { $multiply: ['$likes', 0.3] },
              { $multiply: ['$commentsCount', 0.2] },
              { $multiply: [{ $max: [0, { $subtract: [1, { $divide: ['$ageDays', 14] }] }] }, 100] }
            ]
          }
        }
      },
      { $sort: { trendingScore: -1, createdAt: -1 } },
      { $limit: 12 }
    ]);

    console.log(`✅ Found ${trendingMedia.length} trending items`);
    res.json(trendingMedia);
  } catch (error) {
    console.error('❌ Error fetching trending media:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


// Get media by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const media = await Media.find({ isPublic: true, category })
      .populate('uploader', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Media.countDocuments({ isPublic: true, category });

    res.json({
      media,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch media by category' });
  }
});

// Like media
router.post('/:id/like', auth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    if (media.likedBy.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already liked' });
    }

    media.likedBy.push(req.user.id);
    media.likes = media.likedBy.length;
    await media.save();

    res.json({ message: 'Media liked', likes: media.likes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to like media' });
  }
});

// Unlike media
router.post('/:id/unlike', auth, async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    media.likedBy = media.likedBy.filter(id => id.toString() !== req.user.id);
    media.likes = media.likedBy.length;
    await media.save();

    res.json({ message: 'Like removed', likes: media.likes });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unlike media' });
  }
});

// Get recommendations based on category and watch history
router.get('/recommendations/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    const recommendations = await Media.find({
      isPublic: true,
      category: media.category,
      _id: { $ne: req.params.id }
    })
      .populate('uploader', 'name avatar subscribers')
      .sort({ views: -1 })
      .limit(10);

    res.json({ recommendations });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
});

module.exports = router;