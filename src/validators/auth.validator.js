import Joi from "joi";

export const regesterSchema = Joi.object({
    name: Joi.string().required().trim().max(50).min(3).message({
    'string.empty': 'Please enter your name',
    'string.min': 'Name must be at least 3 characters',
    'string.max': 'Name must not exceed 50 characters',
    }),
    email: Joi.string().required().email().message({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
    }),
    password: Joi.string().min(8).required().max(128).message({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 8 characters',
        'string.max': 'Password must not exceed 128 characters',
    }),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email',
        'string.empty': 'Email is required',
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required',
    }),
});