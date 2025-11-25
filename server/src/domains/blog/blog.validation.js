const Joi = require('joi');

const createSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).required(),
  content: Joi.string().min(1).required(),
  author: Joi.string().trim().optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  published: Joi.boolean().optional(),
  status: Joi.string().valid('draft', 'published', 'archived').optional(),
});

// For updates we do not allow changing `status` or `published` via the generic update route.
// Use the PATCH /:id/status endpoint to change a post's status.
const updateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200).optional(),
  content: Joi.string().min(1).optional(),
  author: Joi.string().trim().optional(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  // `published` and `status` are intentionally omitted to force using the status endpoint
}).min(1);

const statusSchema = Joi.object({
  status: Joi.string().valid('draft', 'published', 'archived').required(),
});

module.exports = {
  createSchema,
  updateSchema,
  statusSchema,
};
