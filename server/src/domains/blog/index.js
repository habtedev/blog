const express = require('express');
const router = express.Router();
const controller = require('./blog.controller');
const { createSchema, updateSchema } = require('./blog.validation');
const validate = require('../../middlewares/validate');

// Routes
router.get('/', controller.list);
router.post('/', validate(createSchema), controller.create);
router.get('/:id', controller.getById);
router.put('/:id', validate(updateSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
