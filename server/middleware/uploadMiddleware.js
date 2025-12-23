const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'video-' + uniqueSuffix + extension);
  }
});

// File filter: allow video for 'video' field and images for 'thumbnail' field
const fileFilter = (req, file, cb) => {
  // Keep formats browser-friendly (no server-side transcoding in this project).
  // MP4/WebM are the most reliably playable across modern browsers.
  const videoTypes = ['.mp4', '.m4v', '.webm', '.mov', '.ogv', '.ogg'];
  const imageTypes = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'thumbnail') {
    if (imageTypes.includes(fileExtension)) return cb(null, true);
    return cb(new Error('Only image files are allowed for thumbnail'), false);
  }

  if (file.fieldname === 'video') {
    if (videoTypes.includes(fileExtension)) return cb(null, true);
    return cb(new Error('Unsupported video format. Please upload MP4 or WebM for best compatibility.'), false);
  }

  // Reject any other fields
  return cb(new Error('Invalid upload field'), false);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit to match client validation
  }
});

module.exports = upload;