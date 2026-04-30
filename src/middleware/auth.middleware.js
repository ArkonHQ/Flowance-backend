import jwt from 'jsonwebtoken';
import { StatusCodes } from "http-status-codes";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../config/env.js";

const authMiddleware = async (req, res, next) => {

    // Extract token from header
    const authHeader = req.headers.authorization

    // Check token exist and has correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'No authorized, no token provided',
        })
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    try {

        const decoded = jwt.verify(token, JWT_SECRET);

        // Find user and attach to request
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: 'User belonging to this token no longer exists',
            })
        }

        req.user = user;
        next ()
    }catch(err) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Token is invalid or expired',
        })
    }
}

export default authMiddleware