const express = require('express');
const router = express.Router();
const controller = require('../domains/blog/blog.controller');
const { createSchema, updateSchema } = require('../domains/blog/blog.validation');
const validate = require('../middlewares/validate');

// Blog routes (mounted under /api in routes/index.js)
router.get('/', controller.list);
router.post('/', validate(createSchema), controller.create);
router.get('/:id', controller.getById);
router.put('/:id', validate(updateSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
