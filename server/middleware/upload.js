import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING',
  api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING'
});

// Check if Cloudinary is properly configured
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('ERROR: Cloudinary environment variables are missing!');
  throw new Error('Cloudinary environment variables are required');
}

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'skillconnect/kyc',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1000, quality: 'auto' }]
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png) are allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4MB (Vercel limit)
  fileFilter
});

console.log('Upload middleware initialized with CloudinaryStorage');

export default upload;
