const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Import sequelize from sequelize.js
const User = require('./User');
const Lesson = require('./Lesson');
const Enrollment = require('./Enrollment');

const LessonProgress = sequelize.define('LessonProgress', {
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
  lessonId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: Lesson,
      key: 'id'
    },
    field: 'lesson_id'
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  watchedDurationSeconds: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'watched_duration_seconds'
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at'
  }
}, {
  tableName: 'lesson_progress',
  timestamps: false, // No created_at/updated_at in init.sql for lesson_progress
  indexes: [
    {
      unique: true,
      fields: ['student_id', 'lesson_id']
    }
  ]
});

// Associations
LessonProgress.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
LessonProgress.belongsTo(Lesson, { foreignKey: 'lesson_id', as: 'lesson' });

module.exports = LessonProgress;