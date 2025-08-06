const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Corrected import
const { asyncHandler } = require('../utils/asyncHandler');

// Authentication middleware
const auth = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'غير مصرح، يجب تسجيل الدخول أولاً'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');

    // Find user by id
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'رمز الوصول غير صحيح'
    });
  }
});

// Authorization middleware for specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'غير مصرح، يجب تسجيل الدخول أولاً'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح للوصول لهذا المورد'
      });
    }
    next();
  };
};

// Optional authentication (for routes that work with or without auth)
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_here');
      const user = await User.findByPk(decoded.userId);
      if (user) {
        req.user = user;
      }
    } catch (error) {
      // Token is invalid, but we continue without user
      req.user = null;
    }
  }

  next();
});

module.exports = {
  auth,
  authorize,
  optionalAuth
};