import Joi from 'joi';

const statusEnum = ['todo', 'in_progress', 'done', 'cancelled'];
const priorityEnum = [1, 2, 3];

export const createTask = Joi.object({
    title: Joi.string().required().trim().min(1).messages({
        'string.empty': 'Task title is required',
    }),
    description: Joi.string().optional(),
    project: Joi.string().hex().length(24).required(),
    status: Joi.string().valid(...statusEnum).default('todo'),
    priority: Joi.number().valid(...priorityEnum).default(2),
    deadline: Joi.date().optional(),

});

export const updateTask = Joi.object({
    title: Joi.string().trim().min(1).optional(),
    description: Joi.string().optional(),
    project: Joi.string().hex().length(24).optional(),
    status: Joi.string().valid(...statusEnum).optional(),
    priority: Joi.number().valid(...priorityEnum).optional(),
    deadline: Joi.date().optional(),
});