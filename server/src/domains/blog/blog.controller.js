const express = require('express');
const service = require('./blog.service');
const logger = require('../../utils/logger');
const HttpError = require('../../utils/httpError');

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


//
const list = async (req, res, next) => {
	try {
		// Ensure pagination query params are numbers
		const { skip = '0', limit = '10' } = req.query;
		const skipNum = Number.parseInt(skip, 10);
		const limitNum = Number.parseInt(limit, 10);
		const safeSkip = Number.isNaN(skipNum) ? 0 : Math.max(0, skipNum);
		const safeLimit = Number.isNaN(limitNum) ? 10 : Math.min(100, Math.max(1, limitNum));

		logger.info('list request', { skip: safeSkip, limit: safeLimit });
		const posts = await service.getPosts({ skip: safeSkip, limit: safeLimit });
		return res.json({ message: 'Posts retrieved', data: posts });
	} catch (err) {
		logger.error('list handler error', err);
		return next(err);
	}
};

const getById = async (req, res, next) => {
	try {
		const { id } = req.params;
		logger.info('getById request', { id });
		const post = await service.getPostById(id);
		if (!post) throw new HttpError(404, 'Post not found');
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
		const updated = await service.updatePost(id, req.body);
		if (!updated) throw new HttpError(404, 'Post not found');
		return res.json({ message: 'Post updated', data: updated });
	} catch (err) {
		logger.error('update handler error', err);
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

module.exports = {
	create,
	list,
	getById,
	update,
	remove,
};
