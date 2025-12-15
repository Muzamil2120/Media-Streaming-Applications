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
  const videoTypes = ['.mp4', '.avi', '.mov', '.wmv', '.mkv', '.webm'];
  const imageTypes = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
  const fileExtension = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'thumbnail') {
    if (imageTypes.includes(fileExtension)) return cb(null, true);
    return cb(new Error('Only image files are allowed for thumbnail'), false);
  }

  if (file.fieldname === 'video') {
    if (videoTypes.includes(fileExtension)) return cb(null, true);
    return cb(new Error('Only video files are allowed'), false);
  }

  // Reject any other fields
  return cb(new Error('Invalid upload field'), false);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

module.exports = upload;