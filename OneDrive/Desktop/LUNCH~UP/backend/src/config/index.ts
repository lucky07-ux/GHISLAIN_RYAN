import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongoUri: process.env.MONGODB_URI || process.env.MONGODB_LOCAL || 'mongodb://localhost:27017/lunchup',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'super_secret_key_change_me',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
  
  // Payment APIs
  payment: {
    orangeMoneyApiKey: process.env.ORANGE_MONEY_API_KEY || '',
    orangeMoneyUrl: process.env.ORANGE_MONEY_API_URL || '',
    mtnMomoApiKey: process.env.MTN_MOMO_API_KEY || '',
    mtnMomoUrl: process.env.MTN_MOMO_API_URL || '',
    notchpay: {
      publicKey: process.env.NOTCHPAY_PUBLIC_KEY || '',
      secretKey: process.env.NOTCHPAY_SECRET_KEY || '',
    },
  },
  
  // Cloudinary
  cloudinary: {
    name: process.env.CLOUDINARY_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  
  // Admin credentials
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@lunchup.cm',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
  },
};

export default config;
