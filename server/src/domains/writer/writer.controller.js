const service = require('./writer.service');
const logger = require('../../utils/logger');
const HttpError = require('../../utils/httpError');
const draftService = require('./draft.service');
const mongoose = require('mongoose');

// create new writer
const create = async (req, res, next) => {
  try {
    logger.info('create writer', { body: req.body });
    const w = await service.createWriter(req.body);
    return res.status(201).json({ message: 'Writer created', data: w });
  } catch (err) {
    logger.error('create writer error', err);
    return next(err);
  }
};

// list writers with pagination
const list = async (req, res, next) => {
  try {
    const { skip = '0', limit = '10' } = req.query;
    const skipNum = Number.parseInt(skip, 10);
    const limitNum = Number.parseInt(limit, 10);
    const writers = await service.getWriters({ skip: skipNum || 0, limit: limitNum || 10 });
    return res.json(writers);
  } catch (err) {
    logger.error('list writers error', err);
    return next(err);
  }
};

// get writer by ID 
const getById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const w = await service.getWriterById(id);
    if (!w) throw new HttpError(404, 'Writer not found');
    return res.json({ message: 'Writer retrieved', data: w });
  } catch (err) {
    logger.error('get writer error', err);
    return next(err);
  }
};

// update writer by ID
const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await service.updateWriter(id, req.body);
    if (!updated) throw new HttpError(404, 'Writer not found');
    return res.json({ message: 'Writer updated', data: updated });
  } catch (err) {
    logger.error('update writer error', err);
    return next(err);
  }
};

//delete writer by ID 
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await service.deleteWriter(id);
    if (!deleted) throw new HttpError(404, 'Writer not found');
    return res.json({ message: 'Writer deleted' });
  } catch (err) {
    logger.error('delete writer error', err);
    return next(err);
  }
};

// Writer draft handlers
const listDrafts = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid writer id');
    const writer = await service.getWriterById(id);
    if (!writer) throw new HttpError(404, 'Writer not found');

    const { skip = '0', limit = '10' } = req.query;
    const skipNum = Number.parseInt(skip, 10) || 0;
    const limitNum = Number.parseInt(limit, 10) || 10;
    const drafts = await draftService.getDraftsByWriter({ writerId: id, skip: skipNum, limit: limitNum });
    return res.json({ message: 'Drafts retrieved', data: drafts });
  } catch (err) {
    logger.error('listDrafts error', err);
    return next(err);
  }
};

const createDraft = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid writer id');
    const writer = await service.getWriterById(id);
    if (!writer) throw new HttpError(404, 'Writer not found');

    const draft = await draftService.createDraft(id, req.body);
    return res.status(201).json({ message: 'Draft created', data: draft });
  } catch (err) {
    logger.error('createDraft error', err);
    return next(err);
  }
};

const getDraft = async (req, res, next) => {
  try {
    const { draftId } = req.params;
    const draft = await draftService.getDraftById(draftId);
    if (!draft) throw new HttpError(404, 'Draft not found');
    return res.json({ message: 'Draft retrieved', data: draft });
  } catch (err) {
    logger.error('getDraft error', err);
    return next(err);
  }
};

const updateDraft = async (req, res, next) => {
  try {
    const { draftId } = req.params;
    const updated = await draftService.updateDraft(draftId, req.body);
    if (!updated) throw new HttpError(404, 'Draft not found');
    return res.json({ message: 'Draft updated', data: updated });
  } catch (err) {
    logger.error('updateDraft error', err);
    return next(err);
  }
};

const deleteDraft = async (req, res, next) => {
  try {
    const { draftId } = req.params;
    const deleted = await draftService.deleteDraft(draftId);
    if (!deleted) throw new HttpError(404, 'Draft not found');
    return res.json({ message: 'Draft deleted' });
  } catch (err) {
    logger.error('deleteDraft error', err);
    return next(err);
  }
};

// Publish a draft: create a Blog post from the draft and optionally delete the draft
const publishDraft = async (req, res, next) => {
  try {
    const { id, draftId } = req.params;
    // optional body { deleteDraft: true|false } default true
    const deleteDraftFlag = req.body && typeof req.body.deleteDraft === 'boolean' ? req.body.deleteDraft : true;

    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid writer id');
    if (!mongoose.Types.ObjectId.isValid(draftId)) throw new HttpError(400, 'Invalid draft id');

    const writer = await service.getWriterById(id);
    if (!writer) throw new HttpError(404, 'Writer not found');

    const draft = await draftService.getDraftById(draftId);
    if (!draft) throw new HttpError(404, 'Draft not found');
    if (String(draft.writer) !== String(id)) throw new HttpError(403, 'Draft does not belong to writer');

    // Build blog payload from draft
    const payload = {
      title: draft.title || 'Untitled',
      content: draft.content || '',
      tags: draft.tags || [],
      author: id,
      status: 'published',
    };

    const created = await require('../blog/blog.service').createPost(payload);

    // Add blog id to writer.posts
    try {
      await service.addPost(id, created._id);
    } catch (err) {
      // log but do not fail the publish if syncing posts fails
      logger.error('Failed to sync writer.posts after publish', { writerId: id, blogId: created._id, err });
    }

    // Optionally delete the draft
    if (deleteDraftFlag) {
      await draftService.deleteDraft(draftId);
    }

    return res.status(201).json({ message: 'Draft published', data: created, draftDeleted: deleteDraftFlag });
  } catch (err) {
    logger.error('publishDraft error', err);
    return next(err);
  }
};

module.exports = { create, list, getById, update, remove, listDrafts, createDraft, getDraft, updateDraft, deleteDraft, publishDraft };
