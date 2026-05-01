import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { validateMiddleware as validate } from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from "../validators/auth.validator.js";

const router = Router();

router.get('/', (req, res) => res.send({ title: 'GET user account' }));

router.post("/register", validate( registerSchema ), register);  // POST to /api/v1/auth/register
router.post("/login", validate( loginSchema ), login);        // POST to /api/v1/auth/login

export default router;