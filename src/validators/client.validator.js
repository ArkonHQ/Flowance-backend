import Joi from 'joi';

export const createClientSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).required().messages({
        'string.empty': 'Client name is required',
        'string.min': 'Name must be at least 1 character',
        'string.max': 'Name must not exceed 100 characters',
    }),
    email: Joi.string().email().messages({
        'string.email': 'Please provide a valid email',
    }),
    company: Joi.string().trim().max(100).messages({
        'string.max': 'Company must not exceed 100 characters',
    }),
});

export const updateClientSchema = Joi.object({
    name: Joi.string().trim().min(1).max(100).messages({
        'string.min': 'Name must be at least 1 character',
        'string.max': 'Name must not exceed 100 characters',
    }),
    email: Joi.string().email().messages({
        'string.email': 'Please provide a valid email',
    }),
    company: Joi.string().trim().max(100),
}).min(1).messages({
    'object.min': 'At least one field must be provided to update',
});