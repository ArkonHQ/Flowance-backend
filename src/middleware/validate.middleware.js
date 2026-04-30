import { StatusCodes } from "http-status-codes";

export const validateMiddleware = (req, res, next) => {

    const error = schema.validate(req.body, { abortEarly: false });

    if (error) {
        const message = error.details.map((detail) => detail.message).join(", ");
        return res.status(StatusCodes.BAD_REQUEST).json({
            status: false,
            message
        })
    }
    next();
}