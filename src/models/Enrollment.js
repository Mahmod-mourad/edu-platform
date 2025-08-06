const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Import sequelize from sequelize.js
const User = require('./User');
const Course = require('./Course');

const Enrollment = sequelize.define('Enrollment', {
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
  enrolledAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'enrolled_at'
  },
  progress: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at'
  }
}, {
  tableName: 'enrollments',
  timestamps: false, // No created_at/updated_at in init.sql for enrollments
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'course_id']
    }
  ]
});

// Associations
Enrollment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

module.exports = Enrollment;