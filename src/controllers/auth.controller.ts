import jwt from 'jsonwebtoken';
import { db } from '../config/db'
import { users } from '../db/tables'
import { StatusCodes } from "http-status-codes";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";


// ──────────────────────────────────────────────
// Helper: Generate JWT token
// ──────────────────────────────────────────────

const generateToken = (newUser) => {
    return jwt.sign(
        { id: newUser.id },
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

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, email))

        if (existingUser.length > 0) return res.status(StatusCodes.CONFLICT).json({
            message: 'User already exists',
        })

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [newUser] = await db
            .insert(users)
            .values({
                name,
                email,
                password: hashedPassword,
            })
            .returning();

        const token = generateToken(newUser);

        res.status(StatusCodes.OK).json({
            success: true,
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
            }
        })
    } catch (err: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Oops, something went wrong',
            success: false,
            error: err.message,
        })
    }
};

// @desc    Login user & return JWT
// @route   POST /api/v1/auth/login
// @access  Public
// ──────────────────────────────────────────────
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by Email
        const result = await db
            .select()
            .from(users)
            .where(eq(users.email, email))

        const user = result[0]

        if (!user) return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Invalid credentials',
        })

        // Check password
        const isMatch = await bcrypt.compare(password, user.password)

        if (!isMatch) return res.status(StatusCodes.UNAUTHORIZED).json({
            message: 'Invalid credentials',
        })

        const token = generateToken(user)

        res.status(StatusCodes.OK).json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
            }
        })

    } catch (err: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: err.message,
            message: 'Oops, something went wrong',
        })
    }
};



export const getMe = async (req, res) => {
    try {
        // req.user.id comes from your auth middleware
        const result = await db
            .select({
                id: users.id,
                name: users.name,
                email: users.email,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, req.user.id))

        const user = result[0]

        if (!user) return res.status(StatusCodes.NOT_FOUND).json({
            message: 'User not found',
        })

        res.json({
            success: true,
            user,
        })
    } catch (err: any) {
        console.log(err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: err.message,
            message: 'Oops, something went wrong',
        })
    }
}
