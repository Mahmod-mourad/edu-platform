const Course = require('../models/Course');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Fetch all courses
// @route   GET /api/courses
// @access  Public
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.findAll({});
  res.json(courses);
});

// @desc    Fetch single course
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findByPk(req.params.id);

  if (course) {
    res.json(course);
  } else {
    res.status(404);
    throw new Error('Course not found');
  }
});

// @desc    Create a course
// @route   POST /api/courses
// @access  Private/Teacher
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, category_id } = req.body;

  const course = new Course({
    title,
    description,
    teacher_id: req.user.id,
    category_id,
  });

  const createdCourse = await course.save();
  res.status(201).json(createdCourse);
});

module.exports = { getCourses, getCourseById, createCourse };
