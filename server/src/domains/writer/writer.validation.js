const Joi = require('joi');

const createWriterSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().email().optional(),
  bio: Joi.string().optional(),
  social: Joi.object({
    twitter: Joi.string().optional(),
    github: Joi.string().optional(),
  }).optional(),
});

const updateWriterSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).optional(),
  email: Joi.string().email().optional(),
  bio: Joi.string().optional(),
  social: Joi.object({
    twitter: Joi.string().optional(),
    github: Joi.string().optional(),
  }).optional(),
}).min(1);

module.exports = { createWriterSchema, updateWriterSchema };
