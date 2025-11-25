const service = require('./writer.service');
const logger = require('../../utils/logger');
const HttpError = require('../../utils/httpError');

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

module.exports = { create, list, getById, update, remove };
