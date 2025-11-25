const Blog = require('./blog.model');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');
const HttpError = require('../../utils/httpError');
const draftService = require('./draft.service');
const writerService = require('../writer/writer.service');

//crete a new blog post
const createPost = async (data) => {
	try {
		// Handle author: accept either ObjectId string or a plain name.
		if (data && data.author) {
			// if provided author looks like an ObjectId, keep it; otherwise treat it as authorName
			if (!mongoose.Types.ObjectId.isValid(String(data.author))) {
				data.authorName = String(data.author);
				data.author = null;
			}
		}
		// If status is provided, ensure `published` boolean reflects it.
		if (data && data.status) {
			data.published = data.status === 'published';
		}
		const post = new Blog(data);
		const saved = await post.save();
		logger.info('Created post', { id: saved._id });
		return saved;
	} catch (err) {
		logger.error('createPost error', err);
		throw err;
	}
};

// get list by pagination
const getPosts = async ({ filter = {}, skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) => {
	try {
		const q = Blog.find(filter).sort(sort).skip(Number(skip)).limit(Number(limit));
		return q.exec();
	} catch (err) {
		logger.error('getPosts error', err);
		throw err;
	}
};

// get post by Id 
const getPostById = async (id) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			throw new HttpError(400, 'Invalid post id');
		}
		return Blog.findById(id).exec();
	} catch (err) {
		logger.error('getPostById error', { id, err });
		throw err;
	}
};

// update post by Id
const updatePost = async (id, data) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			throw new HttpError(400, 'Invalid post id');
		}
		// If author is provided as a plain string (not an ObjectId), treat it as authorName
		if (data && data.author) {
			if (!mongoose.Types.ObjectId.isValid(String(data.author))) {
				data.authorName = String(data.author);
				data.author = null;
			}
		}
		// If status is provided in update, keep `published` consistent.
		if (data && data.status) {
			data.published = data.status === 'published';
		}
		const updated = await Blog.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
		logger.info('Updated post', { id });
		return updated;
	} catch (err) {
		logger.error('updatePost error', { id, err });
		throw err;
	}
};

 // deleted post by Id
const deletePost = async (id) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			throw new HttpError(400, 'Invalid post id');
		}
		const deleted = await Blog.findByIdAndDelete(id).exec();
		logger.info('Deleted post', { id });
		return deleted;
	} catch (err) {
		logger.error('deletePost error', { id, err });
		throw err;
	}
};

// change only status (and keep published flag consistent)
const changePostStatus = async (id, status) => {
	try {
		if (!mongoose.Types.ObjectId.isValid(id)) {
			throw new HttpError(400, 'Invalid post id');
		}
		// If unpublishing (moving to draft) — move the blog into the Draft collection and remove the blog
		if (status === 'draft') {
			const blog = await Blog.findById(id).exec();
			if (!blog) throw new HttpError(404, 'Post not found');

			const payload = {
				title: blog.title,
				content: blog.content,
				author: blog.author || null,
				authorName: blog.authorName || 'Anonymous',
				tags: blog.tags || [],
				metadata: {},
			};

			const createdDraft = await draftService.createDraft(payload);
			// attempt to remove this post id from the writer.posts list if author present
			try {
				if (blog.author && mongoose.Types.ObjectId.isValid(String(blog.author))) {
					await writerService.removePost(String(blog.author), blog._id);
				}
			} catch (err) {
				logger.error('Failed to remove post from writer on unpublish', { blogId: id, err });
			}
			// delete the blog post
			await Blog.findByIdAndDelete(id).exec();
			logger.info('Moved blog to draft', { blogId: id, draftId: createdDraft._id });
			return createdDraft;
		}

		// Otherwise for publish/archived transitions, update the blog document in-place.
		const data = { status };
		data.published = status === 'published';
		// set or clear publishedAt when status changes
		if (status === 'published') {
			data.publishedAt = new Date();
		} else {
			data.publishedAt = null;
		}
		const updated = await Blog.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
		logger.info('Changed post status', { id, status });
		return updated;
	} catch (err) {
		logger.error('changePostStatus error', { id, err });
		throw err;
	}
};


// exporting the function 
module.exports = {
	createPost,
	getPosts,
	getPostById,
	updatePost,
	deletePost,
  changePostStatus,
};
