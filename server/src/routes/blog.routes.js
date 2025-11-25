const express = require('express');
const router = express.Router();
const controller = require('../domains/blog/blog.controller');
const { createSchema, updateSchema } = require('../domains/blog/blog.validation');
const validate = require('../middlewares/validate');
const { statusSchema } = require('../domains/blog/blog.validation');
const { createDraftSchema, updateDraftSchema } = require('../domains/blog/draft.validation');

// Blog routes (mounted under /api in routes/index.js)
router.get('/', controller.list);
router.post('/', validate(createSchema), controller.create);
router.get('/:id', controller.getById);
router.put('/:id', validate(updateSchema), controller.update);
router.patch('/:id/status', validate(statusSchema), controller.changeStatus);
router.delete('/:id', controller.remove);

// Blog drafts (separate from Blog posts)
router.get('/drafts', controller.listDrafts);
router.post('/drafts', validate(createDraftSchema), controller.createDraft);
router.get('/drafts/:draftId', controller.getDraft);
router.put('/drafts/:draftId', validate(updateDraftSchema), controller.updateDraft);
router.delete('/drafts/:draftId', controller.deleteDraft);
router.post('/drafts/:draftId/publish', controller.publishDraft);

module.exports = router;
