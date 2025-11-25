require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { PORT, MONGO_URI } = require('./src/config');

const startServer = async () => {
  try {
    await connectDB(MONGO_URI);

    const server = app.listen(PORT || 8500, () => {
      console.log(`Server running on port ${PORT || 8500}`);
    });

    const shutdownServer = () => {
      console.log('Shutting down server...');
      server.close(() => process.exit(0));
    };

    process.on('SIGTERM', shutdownServer);
    process.on('SIGINT', shutdownServer);
  } catch (error) {
    console.error('Server startup failed:', error);
  }
};

startServer();
