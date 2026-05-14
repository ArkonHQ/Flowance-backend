import { Router } from "express";
// import * as authController from "./auth.controller";
import { requireAuth } from "../../middleware/auth.middleware";
import { validate } from "../../middleware/validate.middleware";
import { registerSchema, loginSchema } from "./auth.schema";

const router = Router();

// router.post("/register", validate(registerSchema), authController.register);
// router.post("/login", validate(loginSchema), authController.login);
// router.get("/me", requireAuth,authController.getMe);

export default router;
