const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');

const app = express();

// middlewares
app.use(express.json());

// security headers
app.use(helmet());

// parse cookies for CSRF
app.use(cookieParser());

// CSRF protection using cookie-based tokens. CSRF validation applies to state-changing methods.
app.use(
	csurf({
		cookie: {
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
		},
	})
);

const logger = require('./utils/logger');

// Simple request logger (uses our logger)
app.use((req, res, next) => {
	logger.info(`${req.method} ${req.url}`);
	next();
});

// Provide a simple endpoint so frontends can fetch the CSRF token.
// The token is issued per request and is safe to expose to JS (the validation cookie is httpOnly).
app.get('/api/csrf-token', (req, res) => {
	try {
		return res.json({ csrfToken: req.csrfToken() });
	} catch (err) {
		return res.status(500).json({ error: 'Failed to create CSRF token' });
	}
});

// Health check endpoint
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
