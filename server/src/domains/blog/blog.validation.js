const Joi = require('joi');

const createSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  content: Joi.string().min(1).required(),
  author: Joi.string().trim().optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  published: Joi.boolean().optional(),
});

const updateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  content: Joi.string().min(1).optional(),
  author: Joi.string().trim().optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  published: Joi.boolean().optional(),
}).min(1);

module.exports = {
  createSchema,
  updateSchema,
};
