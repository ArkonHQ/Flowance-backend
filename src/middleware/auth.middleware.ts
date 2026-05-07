import jwt from "jsonwebtoken";
import { StatusCodes } from 'http-status-codes';
import { db } from "../config/db";
import { eq } from 'drizzle-orm';
import { JWT_SECRET } from "../config/env";
import { users } from "../db/tables/index";
import { Request, Response, NextFunction } from 'express';

// Define the decoded JWT payload type
interface JwtPayload {
    id: string;
    email?: string;
    iat?: number;
    exp?: number;
}

// Define the User type (without password)
interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

// Extend Express Request type to include user property
declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
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
        // @ts-ignore
        const decoded = jwt.verify(token, JWT_SECRET)

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
        // @ts-ignore
        req.user = user;
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