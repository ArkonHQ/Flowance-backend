import { Router } from "express";
import { login, register, getMe } from "../controllers/auth.controller.ts";
import { validateMiddleware as validate } from '../middleware/validate.middleware.ts';
import { registerSchema, loginSchema } from "../validators/auth.validator.ts";
import authMiddleware from "../middleware/auth.middleware.ts";

const router = Router();

router.get('/me', authMiddleware, getMe);

router.post("/register", validate(registerSchema), register);

router.post("/login", validate(loginSchema), login);

router.get("/me", authMiddleware, getMe);


export default router;
