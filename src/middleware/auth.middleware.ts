import jwt from "jsonwebtoken";
import { StatusCodes } from 'http-status-codes';
import { db } from "../config/db";
import { eq } from 'drizzle-orm';
import { JWT_SECRET } from "../config/env";
import { users } from "../db/schema";
import { Request, Response, NextFunction } from 'express';


interface JwtPayload {
    id: number;
}

const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    // Extract token from header
    const authHeader = req.headers.authorization;

    // Check token exists and has correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Not authorized, no token provided',
        });
        return;
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;

        // Find user (excluding password) and attach to request
        const result = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
            })
            .from(users)
            .where(eq(users.id, decoded.id));

        const user = result[0];

        if (!user) {
            res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'User belonging to this token no longer exists',
            });
            return;
        }

        // Attach the full user object to req
        (req as any).user = user;
        next();
    } catch (err) {
        res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Token is invalid or expired',
        });
        return;
    }
};

export default authMiddleware;