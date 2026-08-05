const Joi = require('joi');
const { BadRequestError } = require('../exceptions/customErrors');

const validate = (schema) => (req, res, next) => {
  // Check if it's a new format { body: ..., query: ..., params: ... }
  const isComplexSchema = schema.body || schema.query || schema.params;
  
  if (!isComplexSchema) {
    // Backward compatibility: Assume it's just a body schema
    const { value, error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      const errors = error.details.reduce((acc, curr) => {
        acc[curr.path[0]] = curr.message.replace(/\"/g, '');
        return acc;
      }, {});
      return next(new BadRequestError('Validation failed', errors));
    }
    req.body = value;
    return next();
  }

  // Complex Schema Validation
  const validationOptions = { abortEarly: false, stripUnknown: true };

  if (schema.body) {
    const { value, error } = schema.body.validate(req.body, validationOptions);
    if (error) return next(new BadRequestError('Body validation failed', error.details));
    req.body = value;
  }
  if (schema.query) {
    const { value, error } = schema.query.validate(req.query, validationOptions);
    if (error) return next(new BadRequestError('Query validation failed', error.details));
    req.query = value;
  }
  if (schema.params) {
    const { value, error } = schema.params.validate(req.params, validationOptions);
    if (error) return next(new BadRequestError('Params validation failed', error.details));
    req.params = value;
  }
  
  next();
};

module.exports = validate;
