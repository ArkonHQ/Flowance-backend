import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import {
    getClient,
    createClient,
    getClients,
    deleteClient,
    updateClient
} from "../controllers/client.controller.js";

const clientRouter = Router();

// Apply auth middleware to all routes in this router
clientRouter.use(authMiddleware);

// Corrected route: use "/:id" for dynamic parameter
clientRouter.get("/:id", getClient);   // no need to repeat authMiddleware

clientRouter.get("/", getClients);

clientRouter.post("/", createClient);

clientRouter.delete("/:id", deleteClient);

clientRouter.put("/:id", updateClient);

export default clientRouter;