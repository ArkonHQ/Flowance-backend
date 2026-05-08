import { Router } from "express";
import { login, register, getMe } from "../controllers/auth.controller.ts";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();




router.get('/me', getMe);

router.post("/register", register);

router.post("/login", login);

router.get("/me",authMiddleware, getMe);


export default router;
