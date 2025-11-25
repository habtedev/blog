const express = require('express');
const path = require('path');

const app = express();

// middlewares
app.use(express.json());

// Simple request logger (no extra deps required)
app.use((req, res, next) => {
	const now = new Date().toISOString();
	console.log(`[${now}] ${req.method} ${req.url}`);
	next();
});


app.get('/', (req, res) => {
	res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: 'Not Found' });
});

// Generic error handler
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = app;
