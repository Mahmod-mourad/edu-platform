const { Sequelize } = require('sequelize');

// Database configuration
const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'education_platform',
  username: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'password123',
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

// Test database connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات PostgreSQL بنجاح');

    // Sync models in development
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ تم مزامنة نماذج قاعدة البيانات');
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
    throw error;
  }
};

module.exports = { sequelize, connectDB };