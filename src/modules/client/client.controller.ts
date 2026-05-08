import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import * as clientService from "./client.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const getClients = asyncHandler(async (req: any, res: Response) => {
    const allClients = await clientService.getClientsByOwner(req.user.id);
    res.status(StatusCodes.OK).json({
        success: true,
        clients: allClients,
        count: allClients.length
    });
});

export const getClient = asyncHandler(async (req: any, res: Response) => {
    const client = await clientService.getClientById(parseInt(req.params.id));

    if (!client) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Not Found',
        });
    }

    if (client.ownerId !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Not authorized',
        });
    }

    res.status(StatusCodes.OK).json({
        success: true,
        client,
    });
});

export const createClient = asyncHandler(async (req: any, res: Response) => {
    const newClient = await clientService.createClient(req.user.id, req.body);
    res.status(StatusCodes.CREATED).json({
        success: true,
        client: newClient,
        message: "Client created successfully",
    });
});

export const deleteClient = asyncHandler(async (req: any, res: Response) => {
    const client = await clientService.getClientById(parseInt(req.params.id));

    if (!client) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: `Client not found`,
        });
    }

    if (client.ownerId !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: `Not authorized`,
        });
    }

    const deleted = await clientService.deleteClient(parseInt(req.params.id));
    res.json({
        success: true,
        message: `Client deleted successfully`,
        client: deleted
    });
});

export const updateClient = asyncHandler(async (req: any, res: Response) => {
    const client = await clientService.getClientById(parseInt(req.params.id));

    if (!client) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Client not found',
        });
    }

    if (client.ownerId !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Not authorized',
        });
    }

    const updated = await clientService.updateClient(parseInt(req.params.id), req.body);
    res.status(StatusCodes.OK).json({
        success: true,
        client: updated,
        message: 'Client updated successfully',
    });
});
