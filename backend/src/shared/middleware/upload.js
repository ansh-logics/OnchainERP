const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ErrorResponse = require('../utils/errorResponse');

// Create upload directories if they don't exist
const createDirs = () => {
  const dirs = [
    './uploads',
    './uploads/profile',
    './uploads/assignments'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createDirs();

// Configure storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    let uploadPath = './uploads/';
    
    // Determine upload path based on file type
    if (req.uploadType === 'profile') {
      uploadPath += 'profile/';
    } else if (req.uploadType === 'assignment') {
      uploadPath += 'assignments/';
    }
    
    cb(null, uploadPath);
  },
  filename: function(req, file, cb) {
    // Generate unique filename with timestamp
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  if (req.uploadType === 'profile') {
    // Only allow images for profile pictures
    if (!file.mimetype.startsWith('image/')) {
      return cb(new ErrorResponse('Only image files are allowed for profile pictures', 400), false);
    }
  } else if (req.uploadType === 'assignment') {
    // Allow documents, PDFs, images for assignments
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new ErrorResponse('Invalid file type for assignment submission', 400), false);
    }
  }
  
  cb(null, true);
};

// Set file size limits based on type
const limits = (req) => {
  if (req.uploadType === 'profile') {
    return { fileSize: 2 * 1024 * 1024 }; // 2MB for profile pictures
  } else if (req.uploadType === 'assignment') {
    return { fileSize: 10 * 1024 * 1024 }; // 10MB for assignments
  }
  return { fileSize: 5 * 1024 * 1024 }; // Default 5MB
};

// Multer upload middleware
const upload = (req, res, next) => {
  return multer({
    storage: storage,
    fileFilter: (req, file, cb) => fileFilter(req, file, cb),
    limits: limits(req)
  }).single('file');
};

// Profile picture upload middleware
exports.uploadProfilePicture = (req, res, next) => {
  req.uploadType = 'profile';
  const uploader = upload(req, res, next);
  
  uploader(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ErrorResponse('File too large, max 2MB allowed for profile pictures', 400));
        }
      }
      return next(err);
    }
    next();
  });
};

// Assignment submission upload middleware
exports.uploadAssignment = (req, res, next) => {
  req.uploadType = 'assignment';
  const uploader = upload(req, res, next);
  
  uploader(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ErrorResponse('File too large, max 10MB allowed for assignment submissions', 400));
        }
      }
      return next(err);
    }
    next();
  });
};
