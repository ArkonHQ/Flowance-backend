import { auth } from "../lib/auth";
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: "Unauthorized"
        })
        return
    }

    (req as any).user = session.user
    next()

}