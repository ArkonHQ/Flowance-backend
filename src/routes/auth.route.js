import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";

const router = Router();

router.get('/', (req, res) => res.send({ title: 'GET user account' }));

router.post("/register", register);  // POST to /api/v1/auth/register
router.post("/login", login);        // POST to /api/v1/auth/login

export default router;