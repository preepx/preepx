const Joi = require('joi');
const { BadRequestError } = require('../exceptions/customErrors');

const validate = (schema) => (req, res, next) => {
  const { value, error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.reduce((acc, curr) => {
      acc[curr.path[0]] = curr.message.replace(/\"/g, '');
      return acc;
    }, {});
    return next(new BadRequestError('Validation failed', errors));
  }
  req.body = value;
  next();
};

module.exports = validate;
