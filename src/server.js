const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { connectDB } = require('./config/database');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'تم تجاوز عدد الطلبات المسموح، يرجى المحاولة لاحقاً'
});
app.use(limiter);

// Logging
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    message: 'منصة التعلم الإلكتروني تعمل بشكل طبيعي',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار غير موجود'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 الخادم يعمل على المنفذ ${PORT}`);
      console.log(`🌍 البيئة: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ خطأ في بدء تشغيل الخادم:', error);
    // Don't exit, try to continue without database for health check
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 الخادم يعمل على المنفذ ${PORT} (بدون قاعدة بيانات)`);
    });
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ خطأ غير معالج:', err.message);
  // Don't exit in Docker container
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ استثناء غير معالج:', err.message);
  // Don't exit in Docker container
});

startServer();