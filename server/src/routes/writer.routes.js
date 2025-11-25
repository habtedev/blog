const express = require('express');
const router = express.Router();
const controller = require('../domains/writer/writer.controller');
const { createWriterSchema, updateWriterSchema } = require('../domains/writer/writer.validation');
const validate = require('../middlewares/validate');
const { createDraftSchema, updateDraftSchema } = require('../domains/writer/draft.validation');

router.get('/', controller.list);
router.post('/', validate(createWriterSchema), controller.create);
router.get('/:id', controller.getById);
// Writer drafts
router.get('/:id/drafts', controller.listDrafts);
router.post('/:id/drafts', validate(createDraftSchema), controller.createDraft);
router.get('/:id/drafts/:draftId', controller.getDraft);
router.put('/:id/drafts/:draftId', validate(updateDraftSchema), controller.updateDraft);
router.delete('/:id/drafts/:draftId', controller.deleteDraft);
// Publish a draft: create a Blog post from the draft and optionally delete the draft
router.post('/:id/drafts/:draftId/publish', controller.publishDraft);
router.put('/:id', validate(updateWriterSchema), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
