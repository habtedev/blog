require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { PORT, MONGO_URI } = require('./src/config');
const logger = require('./src/utils/logger');

const startServer = async () => {
  try {
    await connectDB(MONGO_URI);

    const port = PORT || 3000;
    const server = app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });

    const shutdownServer = () => {
      logger.info('Shutting down server...');
      server.close(() => process.exit(0));
    };

    process.on('SIGTERM', shutdownServer);
    process.on('SIGINT', shutdownServer);
  } catch (error) {
    logger.error('Server startup failed:', error);
    process.exit(1);
  }
};

startServer();
