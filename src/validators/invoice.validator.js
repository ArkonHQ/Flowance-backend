import Joi from 'joi'

export const createInvoiceSchema = Joi.object({
    client: Joi.string().required().messages({
        'string.empty': 'Client ID is required',
    }),
    project: Joi.string(),
    amount: Joi.number().positive().required().messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required',
    }),
    status: Joi.string().valid('draft', 'sent', 'paid', 'overdue'),
    paidAt: Joi.date(),
    dueDate: Joi.date(),
});


export const updateInvoiceSchema = Joi.object({
    project: Joi.string(),
    amount: Joi.number().positive().required().messages({
        'number.base': 'Amount must be a number',
        'number.positive': 'Amount must be positive',
        'any.required': 'Amount is required',
    }),
    status: Joi.string().valid('draft', 'sent', 'paid', 'overdue'),
    paidAt: Joi.date(),
    dueDate: Joi.date(),
});