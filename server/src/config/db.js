const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async (mongoUri) => {
    try {
        const uri = mongoUri || process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MongoDB connection URI is not set');
        }
        await mongoose.connect(uri);
        logger.info('MongoDB connected');
    } catch (error) {
        logger.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
};

module.exports = connectDB;