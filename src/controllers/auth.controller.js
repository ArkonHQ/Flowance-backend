import { logger } from '../utils/logger.js';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { StatusCodes } from "http-status-codes";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

// ──────────────────────────────────────────────
// Helper: Generate JWT token
// ──────────────────────────────────────────────

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN || '30d' }
    );
};

// ──────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
// ──────────────────────────────────────────────

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(StatusCodes.CONFLICT).json({
            success: false,
            message: 'User already exists',
        });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate token
    const token = generateToken(user._id);

    // Log before responding (optional but cleaner)
    logger.info(`New user registered: ${user.email}`);

    // Respond
    res.status(StatusCodes.CREATED).json({
        success: true,
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

// @desc    Login user & return JWT
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res) => {
    // TODO: implement proper login logic
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Login route hit — logic coming next',
    });
};