const WriterDraft = require('./draft.model');
const logger = require('../../utils/logger');
const mongoose = require('mongoose');
const HttpError = require('../../utils/httpError');

const createDraft = async (writerId, data) => {
  try {
    const draft = new WriterDraft(Object.assign({}, data, { writer: writerId }));
    const saved = await draft.save();
    logger.info('Created writer draft', { id: saved._id, writer: writerId });
    return saved;
  } catch (err) {
    logger.error('createDraft error', err);
    throw err;
  }
};

const getDraftsByWriter = async ({ writerId, filter = {}, skip = 0, limit = 10, sort = { updatedAt: -1 } } = {}) => {
  try {
    const qFilter = Object.assign({}, filter, { writer: writerId });
    const q = WriterDraft.find(qFilter).sort(sort).skip(Number(skip)).limit(Number(limit));
    return q.exec();
  } catch (err) {
    logger.error('getDraftsByWriter error', err);
    throw err;
  }
};

const getDraftById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid draft id');
    return WriterDraft.findById(id).exec();
  } catch (err) {
    logger.error('getDraftById error', { id, err });
    throw err;
  }
};

const updateDraft = async (id, data) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid draft id');
    const updated = await WriterDraft.findByIdAndUpdate(id, data, { new: true, runValidators: true }).exec();
    logger.info('Updated writer draft', { id });
    return updated;
  } catch (err) {
    logger.error('updateDraft error', { id, err });
    throw err;
  }
};

const deleteDraft = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) throw new HttpError(400, 'Invalid draft id');
    const deleted = await WriterDraft.findByIdAndDelete(id).exec();
    logger.info('deleteDraft', { id });
    return deleted;
  } catch (err) {
    logger.error('deleteDraft error', { id, err });
    throw err;
  }
};

module.exports = { createDraft, getDraftsByWriter, getDraftById, updateDraft, deleteDraft };
