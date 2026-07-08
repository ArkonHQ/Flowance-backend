import { auth } from "../lib/auth";
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const session = await auth.api.getSession({ headers: req.headers });

        if (!session) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Unauthorized"
            });
        }
        (req as any).user = session.user;
        next();
    } catch (error: any) {
        console.error("Auth middleware error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Authentication failed",
            error: error.message
        });
    }
};