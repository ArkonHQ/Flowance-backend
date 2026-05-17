import { auth } from "../lib/auth";
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(`[AUTH DEBUG] Request URL: ${req.method} ${req.originalUrl}`);
        console.log(`[AUTH DEBUG] Incoming Headers:`, JSON.stringify(req.headers, null, 2));
        
        const session = await auth.api.getSession({ headers: req.headers });
        
        console.log(`[AUTH DEBUG] Resolved Session:`, session);

        if (!session) {
            console.log(`[AUTH DEBUG] Rejecting request: Unauthorized`);
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