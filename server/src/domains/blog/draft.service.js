const BlogDraft = require('./draft.model');
const Blog = require('./blog.model');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');
const HttpError = require('../../utils/httpError');

const createDraft = async (data) => {
  try {
    const draft = new BlogDraft(data);
    const saved = await draft.save();
    logger.info('Created blog draft', { id: saved._id });
    return saved;
  } catch (err) {
    logger.error('createDraft error', err);
    throw err;
  }
};

const getDrafts = async ({ filter = {}, skip = 0, limit = 10, sort = { updatedAt: -1 } } = {}) => {
  try {
    const q = BlogDraft.find(filter).sort(sort).skip(Number(skip)).limit(Number(limit));
    return q.exec();
  } catch (err) {
    logger.error('getDrafts error', err);
    throw err;
  }
};

const getDraftById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid draft id');
    return BlogDraft.findById(id).exec();
  } catch (err) {
    logger.error('getDraftById error', { id, err });
    throw err;
  }
};

const updateDraft = async (id, data) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid draft id');
    const updated = await BlogDraft.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    logger.info('Updated blog draft', { id });
    return updated;
  } catch (err) {
    logger.error('updateDraft error', { id, err });
    throw err;
  }
};

const deleteDraft = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid draft id');
    const deleted = await BlogDraft.findByIdAndDelete(id).exec();
    logger.info('Deleted blog draft', { id });
    return deleted;
  } catch (err) {
    logger.error('deleteDraft error', { id, err });
    throw err;
  }
};

// publish draft -> create Blog post and optionally delete draft
const publishDraft = async (id, { deleteDraft = true } = {}) => {
  try {
    const draft = await getDraftById(id);
    if (!draft) throw new HttpError(404, 'Draft not found');

    const payload = {
      title: draft.title || 'Untitled',
      content: draft.content || '',
      tags: draft.tags || [],
      author: draft.author || null,
      authorName: draft.authorName || 'Anonymous',
      status: 'published',
    };

        const created = await Blog.create(payload);
        logger.info('Published blog from draft', { draftId: id, blogId: created._id });

        // If the draft referenced a writer (author), attempt to sync the writer.posts array
        try {
          const writerService = require('../writer/writer.service');
          if (payload.author && mongoose.Types.ObjectId.isValid(String(payload.author))) {
            await writerService.addPost(String(payload.author), created._id);
          }
        } catch (err) {
          logger.error('Failed to sync writer.posts during blog draft publish', { draftId: id, err });
        }

        if (deleteDraft) {
          await deleteDraft(id);
        }
        return created;
  } catch (err) {
    logger.error('publishDraft error', { id, err });
    throw err;
  }
};

module.exports = { createDraft, getDrafts, getDraftById, updateDraft, deleteDraft, publishDraft };
