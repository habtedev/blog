const express = require('express');
const service = require('./blog.service');
const logger = require('../../utils/logger');
const HttpError = require('../../utils/httpError');
const draftService = require('./draft.service');
const mongoose = require('mongoose');

// Controllers with explicit try/catch so we can attach status codes and details
const create = async (req, res, next) => {
	try {
		logger.info('create request', { body: req.body });
		if (!req.body || !req.body.title || !req.body.content) {
			throw new HttpError(400, 'Missing required fields: title and content');
		}
		const post = await service.createPost(req.body);
		return res.status(201).json({ message: 'Post created', data: post });
	} catch (err) {
		logger.error('create handler error', err);
		return next(err);
	}
};


// list post with pagination
const list = async (req, res, next) => {
	try {
		// Ensure pagination query params are numbers
		const { skip = '0', limit = '10' } = req.query;
		const skipNum = Number.parseInt(skip, 10);
		const limitNum = Number.parseInt(limit, 10);
		const safeSkip = Number.isNaN(skipNum) ? 0 : Math.max(0, skipNum);
		const safeLimit = Number.isNaN(limitNum) ? 10 : Math.min(100, Math.max(1, limitNum));

		// Support filtering by status: draft | published | archived | all
		const { status = 'published' } = req.query; // default return only published posts
		const filter = {};
		if (status && status !== 'all') {
			filter.status = status;
		}
		logger.info('list request', { skip: safeSkip, limit: safeLimit, status });
		const posts = await service.getPosts({ filter, skip: safeSkip, limit: safeLimit });
		return res.json({ message: 'Posts retrieved', data: posts });
	} catch (err) {
		logger.error('list handler error', err);
		return next(err);
	}
};

// get post by ID
const getById = async (req, res, next) => {
	try {
		const { id } = req.params;
		logger.info('getById request', { id });
		const post = await service.getPostById(id);
		if (!post) throw new HttpError(404, 'Post not found');

		// Enforce separation: drafts/archived posts are not returned by public GET unless preview=true
		const preview = String(req.query.preview || '').toLowerCase() === 'true';
		if (!preview && post.status && post.status !== 'published') {
			// hide drafts/archived from public listing
			throw new HttpError(404, 'Post not found');
		}

		return res.json({ message: 'Post retrieved', data: post });
	} catch (err) {
		logger.error('getById handler error', err);
		return next(err);
	}
};

const update = async (req, res, next) => {
	try {
		const { id } = req.params;
		logger.info('update request', { id });
		// Prevent changing publish status via the generic update route.
		if (req.body && ('status' in req.body || 'published' in req.body || 'publishedAt' in req.body)) {
			delete req.body.status;
			delete req.body.published;
			delete req.body.publishedAt;
		}
		const updated = await service.updatePost(id, req.body);
		if (!updated) throw new HttpError(404, 'Post not found');
		return res.json({ message: 'Post updated', data: updated });
	} catch (err) {
		logger.error('update handler error', err);
		return next(err);
	}
};

const changeStatus = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { status } = req.body;
		logger.info('changeStatus request', { id, status });
		const updated = await service.changePostStatus(id, status);
		if (!updated) throw new HttpError(404, 'Post not found');
		return res.json({ message: `Post status updated to ${status}`, data: updated });
	} catch (err) {
		logger.error('changeStatus handler error', err);
		return next(err);
	}
};

const remove = async (req, res, next) => {
	try {
		const { id } = req.params;
		logger.info('delete request', { id });
		const deleted = await service.deletePost(id);
		if (!deleted) throw new HttpError(404, 'Post not found');
		return res.status(200).json({ message: 'Post deleted' });
	} catch (err) {
		logger.error('delete handler error', err);
		return next(err);
	}
};

// Blog draft handlers
const listDrafts = async (req, res, next) => {
	try {
		const { skip = '0', limit = '10' } = req.query;
		const skipNum = Number.parseInt(skip, 10) || 0;
		const limitNum = Number.parseInt(limit, 10) || 10;
		const filter = {};
		const drafts = await draftService.getDrafts({ filter, skip: skipNum, limit: limitNum });
		return res.json({ message: 'Drafts retrieved', data: drafts });
	} catch (err) {
		logger.error('listDrafts error', err);
		return next(err);
	}
};

const createDraft = async (req, res, next) => {
	try {
		const payload = req.body || {};
		const draft = await draftService.createDraft(payload);
		return res.status(201).json({ message: 'Draft created', data: draft });
	} catch (err) {
		logger.error('createDraft error', err);
		return next(err);
	}
};

const getDraft = async (req, res, next) => {
	try {
		const { draftId } = req.params;
		if (!mongoose.Types.ObjectId.isValid(draftId)) throw new HttpError(400, 'Invalid draft id');
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
		if (!mongoose.Types.ObjectId.isValid(draftId)) throw new HttpError(400, 'Invalid draft id');
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
		if (!mongoose.Types.ObjectId.isValid(draftId)) throw new HttpError(400, 'Invalid draft id');
		const deleted = await draftService.deleteDraft(draftId);
		if (!deleted) throw new HttpError(404, 'Draft not found');
		return res.json({ message: 'Draft deleted' });
	} catch (err) {
		logger.error('deleteDraft error', err);
		return next(err);
	}
};

const publishDraft = async (req, res, next) => {
	try {
		const { draftId } = req.params;
		if (!mongoose.Types.ObjectId.isValid(draftId)) throw new HttpError(400, 'Invalid draft id');
		const deleteDraftFlag = req.body && typeof req.body.deleteDraft === 'boolean' ? req.body.deleteDraft : true;
		const created = await draftService.publishDraft(draftId, { deleteDraft: deleteDraftFlag });
		return res.status(201).json({ message: 'Draft published', data: created, draftDeleted: deleteDraftFlag });
	} catch (err) {
		logger.error('publishDraft error', err);
		return next(err);
	}
};

module.exports = {
	create,
	list,
	getById,
	update,
	changeStatus,
	remove,
	listDrafts,
	createDraft,
	getDraft,
	updateDraft,
	deleteDraft,
	publishDraft,
};
