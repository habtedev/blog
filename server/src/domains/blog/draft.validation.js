const Joi = require('joi');

const createDraftSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional().allow(''),
  content: Joi.string().optional().allow(''),
  author: Joi.string().trim().optional(),
  authorName: Joi.string().trim().optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  metadata: Joi.object().optional(),
});

const updateDraftSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional().allow(''),
  content: Joi.string().optional().allow(''),
  author: Joi.string().trim().optional(),
  authorName: Joi.string().trim().optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  metadata: Joi.object().optional(),
}).min(1);

module.exports = { createDraftSchema, updateDraftSchema };
