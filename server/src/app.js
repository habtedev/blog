const express = require('express');
const path = require('path');

const app = express();

// middlewares
app.use(express.json());

const logger = require('./utils/logger');

// Simple request logger (uses our logger)
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});


app.get('/', (req, res) => {
	res.json({ status: 'ok' });
});

// Mount API routes
app.use('/api', require('./routes'));

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: 'Not Found' });
});

// Centralized error handler (moved to separate middleware)
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;
