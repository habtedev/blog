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
module.exports = {
  createWriter,
  getWriters,
  getWriterById,
  updateWriter,
  deleteWriter,
};
