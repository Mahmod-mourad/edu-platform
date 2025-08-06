const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize'); // Import sequelize from sequelize.js

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false // Categories table does not have updated_at in init.sql
});

module.exports = Category;