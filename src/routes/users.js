const express = require('express');
const User = require('../models/User'); // Corrected import
const { auth, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const Joi = require('joi');

const router = express.Router();

// Profile update validation schema
const updateProfileSchema = Joi.object({
  firstName: Joi.string().min(2).max(100).trim(),
  lastName: Joi.string().min(2).max(100).trim(),
  profileImage: Joi.string().uri().allow('', null)
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id);
  
  res.status(200).json({
    success: true,
    data: { user }
  });
}));

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, asyncHandler(async (req, res) => {
  // Validate input
  const { error, value } = updateProfileSchema.validate(req.body);
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

  // Update user
  const user = await User.findByPk(req.user.id);
  
  if (value.firstName) user.firstName = value.firstName;
  if (value.lastName) user.lastName = value.lastName;
  if (value.profileImage !== undefined) user.profileImage = value.profileImage;
  
  await user.save();

  res.status(200).json({
    success: true,
    message: 'تم تحديث الملف الشخصي بنجاح',
    data: { user }
  });
}));

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', auth, authorize('admin'), asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const { count, rows: users } = await User.findAndCountAll({
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalUsers: count,
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1
      }
    }
  });
}));

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private/Admin
router.get('/:id', auth, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  
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

// @route   PUT /api/users/:id/role
// @desc    Update user role (Admin only)
// @access  Private/Admin
router.put('/:id/role', auth, authorize('admin'), asyncHandler(async (req, res) => {
  const { role } = req.body;
  
  if (!['student', 'instructor', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'نوع المستخدم غير صحيح'
    });
  }

  const user = await User.findByPk(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'المستخدم غير موجود'
    });
  }

  user.role = role;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'تم تحديث دور المستخدم بنجاح',
    data: { user }
  });
}));

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, authorize('admin'), asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'المستخدم غير موجود'
    });
  }

  // Prevent admin from deleting themselves
  if (user.id === req.user.id) {
    return res.status(400).json({
      success: false,
      message: 'لا يمكن حذف حسابك الخاص'
    });
  }

  await user.destroy();

  res.status(200).json({
    success: true,
    message: 'تم حذف المستخدم بنجاح'
  });
}));

module.exports = router;