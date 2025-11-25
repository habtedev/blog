const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
    try {
        const uri = mongoUri || process.env.MONGO_URI;
        if (!uri) {
            throw new Error('MongoDB connection URI is not set');
        }
        await mongoose.connect(uri);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        process.exit(1);
    }
};

module.exports = connectDB;