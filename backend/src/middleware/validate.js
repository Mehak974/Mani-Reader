'use strict';
const Joi = require('joi');

/**
 * Validation middleware factory.
 * Usage: validate(schema) where schema is a Joi object schema for req.body.
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const details = error.details.map((d) => d.message);
      return res.status(400).json({ error: 'Validation failed', details });
    }
    req.body = value;
    next();
  };
}

// ── Schemas ───────────────────────────────────────────────────────────────────

const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  createLibrary: Joi.object({
    name: Joi.string().min(1).max(100).required(),
  }),

  addToLibrary: Joi.object({
    mangaId: Joi.string().required(),
  }),

  bookmark: Joi.object({
    mangaId: Joi.string().required(),
    chapterId: Joi.string().required(),
    page: Joi.number().integer().min(0).default(0),
  }),

  history: Joi.object({
    mangaId: Joi.string().required(),
    chapterId: Joi.string().required(),
    page: Joi.number().integer().min(0).default(0),
  }),

  progress: Joi.object({
    mangaId: Joi.string().required(),
    chapterId: Joi.string().required(),
    page: Joi.number().integer().min(0).default(0),
    isRead: Joi.boolean().default(false),
  }),

  download: Joi.object({
    chapterId: Joi.string().required(),
  }),
};

module.exports = { validate, schemas };
