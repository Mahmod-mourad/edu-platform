const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Import sequelize from sequelize.js
const User = require('./User');
const Course = require('./Course');

const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  studentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    field: 'student_id'
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Course,
      key: 'id'
    },
    field: 'course_id'
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'reviews',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false, // Reviews table does not have updated_at in init.sql
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'course_id']
    }
  ]
});

// Associations
Review.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Review.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

module.exports = Review;