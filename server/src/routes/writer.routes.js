const express = require('express');
const router = express.Router();
const controller = require('../domains/writer/writer.controller');
const { createWriterSchema, updateWriterSchema } = require('../domains/writer/writer.validation');
const validate = require('../middlewares/validate');

router.get('/', controller.list);
router.post('/', validate(createWriterSchema), controller.create);
router.get('/:id', controller.getById);
router.put('/:id', validate(updateWriterSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
