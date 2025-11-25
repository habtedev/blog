const Writer = require('./writer.model');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');
const HttpError = require('../../utils/httpError');

// create a new writer 
const createWriter = async (data) => {
  try {
    const w = new Writer(data);
    const saved = await w.save();
    logger.info('Created writer', { id: saved._id });
    return saved;
  } catch (err) {
    logger.error('createWriter error', err);
    throw err;
  }
};

// get list writer by pagination
const getWriters = async ({ filter = {}, skip = 0, limit = 10, sort = { createdAt: -1 } } = {}) => {
  try {
    const q = Writer.find(filter).sort(sort).skip(Number(skip)).limit(Number(limit));
    return q.exec();
  } catch (err) {
    logger.error('getWriters error', err);
    throw err;
  }
};

// get writer by ID
const getWriterById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid writer id');
    return Writer.findById(id).exec();
  } catch (err) {
    logger.error('getWriterById error', { id, err });
    throw err;
  }
};

// update writer bu iD 
const updateWriter = async (id, data) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid writer id');
    const updated = await Writer.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    logger.info('Updated writer', { id });
    return updated;
  } catch (err) {
    logger.error('updateWriter error', { id, err });
    throw err;
  }
};

// delete writer by ID 
const deleteWriter = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid writer id');
    const deleted = await Writer.findByIdAndDelete(id).exec();
    logger.info('Deleted writer', { id });
    return deleted;
  } catch (err) {
    logger.error('deleteWriter error', { id, err });
    throw err;
  }
};

// export service 
// add a post id to writer.posts (avoid duplicates)
const addPost = async (writerId, postId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(writerId)) throw new HttpError(400, 'Invalid writer id');
    if (!mongoose.Types.ObjectId.isValid(postId)) throw new HttpError(400, 'Invalid post id');
    const updated = await Writer.findByIdAndUpdate(
      writerId,
      { $addToSet: { posts: postId } },
      { new: true }
    ).exec();
    if (!updated) throw new HttpError(404, 'Writer not found');
    logger.info('Added post to writer', { writerId, postId });
    return updated;
  } catch (err) {
    logger.error('addPost error', { writerId, postId, err });
    throw err;
  }
};

// remove a post id from writer.posts
const removePost = async (writerId, postId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(writerId)) throw new HttpError(400, 'Invalid writer id');
    if (!mongoose.Types.ObjectId.isValid(postId)) throw new HttpError(400, 'Invalid post id');
    const updated = await Writer.findByIdAndUpdate(
      writerId,
      { $pull: { posts: postId } },
      { new: true }
    ).exec();
    if (!updated) throw new HttpError(404, 'Writer not found');
    logger.info('Removed post from writer', { writerId, postId });
    return updated;
  } catch (err) {
    logger.error('removePost error', { writerId, postId, err });
    throw err;
  }
};

module.exports = {
  createWriter,
  getWriters,
  getWriterById,
  updateWriter,
  deleteWriter,
  addPost,
  removePost,
};
