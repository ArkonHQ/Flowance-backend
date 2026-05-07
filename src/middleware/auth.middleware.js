// middleware/authMiddleware.ts
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { db, users } from '../db/index.js';
import { eq } from 'drizzle-orm';
import { JWT_SECRET } from '../config/env.js';

const authMiddleware = async (req, res, next) => {
    // Extract token from header
    const authHeader = req.headers.authorization;

    // Check token exists and has correct format
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Not authorized, no token provided',
        });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find user (excluding password) and attach to request
        const result = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt,
                // Add any other fields you need, but never the password
            })
            .from(users)
            .where(eq(users.id, decoded.id));

        const user = result[0];

        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'User belonging to this token no longer exists',
            });
        }

        // Attach the full user object (minus password) to req
        req.user = user;
        next();
    } catch (err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Token is invalid or expired',
        });
    }
};

export default authMiddleware;