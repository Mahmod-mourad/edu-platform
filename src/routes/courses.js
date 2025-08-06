const express = require('express');
const { Op } = require('sequelize');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');
const Course = require('../models/Course');
const User = require('../models/User'); // To include instructor details
const Category = require('../models/Category'); // To include category details

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all published courses
// @access  Public
router.get('/', optionalAuth, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const category = req.query.category;
  const level = req.query.level;
  const search = req.query.search;

  // Build where clause
  const whereClause = { isPublished: true };
    
  if (category) {
    // Find category ID by name if category is provided as name
    const cat = await Category.findOne({ where: { name: category } });
    if (cat) {
      whereClause.categoryId = cat.id;
    } else {
      // If category name doesn't exist, return empty array
      return res.status(200).json({
        success: true,
        data: {
          courses: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            totalCourses: 0,
            hasNextPage: false,
            hasPrevPage: false
          }
        }
      });
    }
  }
  if (level) whereClause.level = level;
  if (search) {
    whereClause[Op.or] = [
      { title: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }

  const { count, rows: courses } = await Course.findAndCountAll({
    where: whereClause,
    limit,
    offset,
    include: [
      { model: User, as: 'instructor', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Category, as: 'category', attributes: ['id', 'name'] }
    ],
    order: [['created_at', 'DESC']]
  });

  res.status(200).json({
    success: true,
    data: {
      courses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalCourses: count,
        hasNextPage: page < Math.ceil(count / limit),
        hasPrevPage: page > 1
      }
    }
  });
}));

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', optionalAuth, asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id, {
    include: [
      { model: User, as: 'instructor', attributes: ['id', 'firstName', 'lastName', 'email'] },
      { model: Category, as: 'category', attributes: ['id', 'name'] }
    ]
  });

  if (!course) {
    return res.status(404).json({
      success: false,
      message: 'الدورة غير موجودة'
    });
  }

  res.status(200).json({
    success: true,
    data: { course }
  });
}));

// @route   POST /api/courses
// @desc    Create new course (Instructor only)
// @access  Private/Instructor
router.post('/', auth, authorize('instructor', 'admin'), asyncHandler(async (req, res) => {
  const { title, description, categoryId, price, durationHours, level, thumbnail, isPublished } = req.body;

  // Basic validation (more detailed validation can be added with Joi)
  if (!title || !description || !categoryId || !price || !durationHours || !level) {
    return res.status(400).json({ success: false, message: 'الرجاء إدخال جميع الحقول المطلوبة' });
  }

  const course = await Course.create({
    title,
    description,
    instructorId: req.user.id,
    categoryId,
    price,
    durationHours,
    level,
    thumbnail,
    isPublished: isPublished || false
  });

  res.status(201).json({
    success: true,
    message: 'تم إنشاء الدورة بنجاح',
    data: { course }
  });
}));

module.exports = router;