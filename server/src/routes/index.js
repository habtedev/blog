const express = require('express');
const router = express.Router();

// Mount domain-specific route modules under /api
router.use('/blog', require('./blog.routes'));
router.use('/writer', require('./writer.routes'));

module.exports = router;
