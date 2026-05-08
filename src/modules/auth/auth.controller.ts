import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as authService from "./auth.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const existingUser = await authService.findUserByEmail(email);

    if (existingUser) {
        return res.status(StatusCodes.CONFLICT).json({
            success: false,
            message: 'User already exists',
        });
    }

    const newUser = await authService.createUser({ name, email, password });
    const token = authService.generateToken(newUser);

    res.status(StatusCodes.OK).json({
        success: true,
        token,
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
        }
    });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const user = await authService.findUserByEmail(email);

    if (!user || !(await authService.verifyPassword(password, user.password))) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
            success: false,
            message: 'Invalid credentials',
        });
    }

    const token = authService.generateToken(user);

    res.status(StatusCodes.OK).json({
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        }
    });
});

export const getMe = asyncHandler(async (req: any, res: Response) => {
    const user = await authService.findUserById(req.user.id);

    if (!user) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'User not found',
        });
    }

    res.json({
        success: true,
        user,
    });
});
