import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
    getClient,
    createClient,
    getClients,
    deleteClient,
    updateClient
} from "../controllers/client.controller";


const clientRouter = Router();

clientRouter.use(authMiddleware)

clientRouter.get("/:id", getClient);

clientRouter.get("/", getClients);

clientRouter.post("/", createClient);

clientRouter.delete("/:id", deleteClient);

clientRouter.put("/:id", updateClient);

export default clientRouter;