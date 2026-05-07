import Joi from 'joi';

const statusEnum = ['todo', 'in_progress', 'cancelled', 'delayed','done']; // adjust as needed

export const createProjectValidator = Joi.object({
    title: Joi.string().required().trim().min(1).messages({
        'string.empty': 'Project title is required',
    }),
    description: Joi.string().optional(),
    client: Joi.string().hex().length(24).required(),
    status: Joi.string().valid(...statusEnum).default('active'),
    deadline: Joi.date().optional(),
});

export const updateProjectValidator = Joi.object({
    title: Joi.string().trim().min(1).optional(),
    description: Joi.string().optional(),
    client: Joi.string().hex().length(24).optional(),
    status: Joi.string().valid(...statusEnum).optional(),
    deadline: Joi.date().optional(),
});