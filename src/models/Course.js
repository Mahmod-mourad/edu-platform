const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Import sequelize from sequelize.js
const User = require('./User');
const Category = require('./Category');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  instructorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    field: 'instructor_id'
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: Category,
      key: 'id'
    },
    field: 'category_id'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  durationHours: {
    type: DataTypes.INTEGER,
    field: 'duration_hours'
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_published'
  },
  thumbnail: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'courses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
Course.belongsTo(User, { foreignKey: 'instructor_id', as: 'instructor' });
Course.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

module.exports = Course;