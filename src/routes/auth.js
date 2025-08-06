const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/User'); // Corrected import
const { validateRegistration, validateLogin } = require('../validators/authValidator');
const { asyncHandler } = require('../utils/asyncHandler');

const router = express.Router();

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'تم تجاوز عدد محاولات تسجيل الدخول، يرجى المحاولة لاحقاً',
  skipSuccessfulRequests: true
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'your_super_secret_jwt_key_here',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', authLimiter, asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = validateRegistration(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'بيانات غير صحيحة',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }

  const { email, password, firstName, lastName, role } = value;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: 'البريد الإلكتروني مسجل مسبقاً'
    });
  }

  // Create new user
  const user = await User.create({
    email,
    passwordHash: password, // Will be hashed by the model hook
    firstName,
    lastName,
    role: role || 'student'
  });

  // Generate token
  const token = generateToken(user.id);

  // Send response
  res.status(201).json({
    success: true,
    message: 'تم إنشاء الحساب بنجاح',
    data: {
      user,
      token
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = validateLogin(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'بيانات غير صحيحة',
      errors: error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }))
    });
  }

  const { email, password } = value;

  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    });
  }

  // Validate password
  const isPasswordValid = await user.validatePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
    });
  }

  // Generate token
  const token = generateToken(user.id);

  // Send response
  res.status(200).json({
    success: true,
    message: 'تم تسجيل الدخول بنجاح',
    data: {
      user,
      token
    }
  });
}));

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', require('../middleware/auth').auth, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'المستخدم غير موجود'
    });
  }

  res.status(200).json({
    success: true,
    data: { user }
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', require('../middleware/auth').auth, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'تم تسجيل الخروج بنجاح'
  });
}));

module.exports = router;