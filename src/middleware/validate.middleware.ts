import { ZodSchema } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const validate = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const message = result.error.issues
            .map((i) => `${i.path.join('.')}: ${i.message}`)
            .join(', ');
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message });
    }

    req.body = result.data
    next();
}