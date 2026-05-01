import Joi from 'joi';

const statusEnum = ['todo', 'in_progress', 'done', 'cancelled'];
const priorityEnum = ['low', 'medium', "high" ];

export const createTaskValidator = Joi.object({
    title: Joi.string().required().trim().min(1).messages({
        'string.empty': 'Task title is required',
    }),
    description: Joi.string().optional(),
    project: Joi.string().hex().length(24).required(),
    status: Joi.string().valid(...statusEnum).default('todo'),
    priority: Joi.number().valid(...priorityEnum).default("medium"),
    deadline: Joi.date().optional(),

});

export const updateTaskValidator = Joi.object({
    title: Joi.string().trim().min(1).optional(),
    description: Joi.string().optional(),
    project: Joi.string().hex().length(24).optional(),
    status: Joi.string().valid(...statusEnum).optional(),
    priority: Joi.number().valid(...priorityEnum).optional(),
    deadline: Joi.date().optional(),
});