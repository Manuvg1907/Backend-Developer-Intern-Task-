const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/securerestapi';
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.warn('MongoDB connection error:', error.message);
    console.warn('Server will start but database operations may fail.');
    console.warn('Please ensure MongoDB is running at:', process.env.MONGODB_URI || 'mongodb://localhost:27017/securerestapi');
  }
};

module.exports = connectDB;
