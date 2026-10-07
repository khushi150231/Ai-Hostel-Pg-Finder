import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary from environment variables
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Multer memory storage configuration for file buffers
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per file max
    files: 10, // max 10 images
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'), false);
    }
  },
});

/**
 * Upload a single buffer to Cloudinary
 */
export const uploadBufferToCloudinary = (fileBuffer, folder = 'staynear_hostels') => {
  return new Promise((resolve, reject) => {
    // If Cloudinary is not configured or in demo mode, return a high-res mock image URL
    if (
      !process.env.CLOUDINARY_API_SECRET ||
      process.env.CLOUDINARY_API_SECRET === 'your_cloudinary_api_secret_here' ||
      process.env.CLOUDINARY_API_SECRET === 'demo_cloudinary_secret'
    ) {
      const demoImages = [
        'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80',
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
        'https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1200&q=80',
        'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&q=80',
      ];
      const randomDemo = demoImages[Math.floor(Math.random() * demoImages.length)];
      return resolve(randomDemo);
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ width: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload multiple files to Cloudinary concurrently
 */
export const uploadMultipleImages = async (files, folder = 'staynear_hostels') => {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map((file) => uploadBufferToCloudinary(file.buffer, folder));
  return Promise.all(uploadPromises);
};
