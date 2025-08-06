const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Import sequelize from sequelize.js
const Course = require('./Course');

const Lesson = sequelize.define('Lesson', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT
  },
  videoUrl: {
    type: DataTypes.STRING(255),
    field: 'video_url'
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    field: 'duration_minutes'
  },
  orderIndex: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_index'
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_free'
  }
}, {
  tableName: 'lessons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
Lesson.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

module.exports = Lesson;