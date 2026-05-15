import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { clientService } from "./client.service";
import { asyncHandler } from "../../utils/asyncHandler";
import { createClientSchema, updateClientSchema } from "./client.schema";


export const getClients = asyncHandler(async (req: any, res: Response) => {
    const allClients = await clientService.getActiveClients(req.user.id);
    res.status(StatusCodes.OK).json({
        success: true,
        clients: allClients,
        count: allClients.length
    });
});

export const getClient = asyncHandler(async (req: any, res: Response) => {
    const client = await clientService.getActiveClientById(parseInt(req.params.id), req.user.id);

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


export const getClientInsight = asyncHandler(async(req: any, res: Response) => {
    const clientId = parseInt(req.params.id);
    const ownerId = req.user.id;
    
    const insight = await clientService.getClientInsight(clientId, ownerId);

    if (!insight) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Insight not found'
        });
    }

    return res.status(StatusCodes.OK).json({
        success: true,
        insight
    })
})


export const createClient = asyncHandler(async (req: any, res: Response) => {
    // 1. Validate the request body first
    const validatedData = createClientSchema.parse(req.body);

    // 2. Create the client using validated data
    const newClient = await clientService.createClient({
        ...validatedData,
        ownerId: req.user.id,
    });

    res.status(StatusCodes.CREATED).json({
        success: true,
        client: newClient,
        message: "Client created successfully",
    });
});


export const deleteClient = asyncHandler(async (req: any, res: Response) => {
    const client = await clientService.getActiveClientById(parseInt(req.params.id), req.user.id);

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

    const deleted = await clientService.deleteClient(parseInt(req.params.id), req.user.id);
    res.json({
        success: true,
        message: `Client deleted successfully`,
        client: deleted
    });
});

export const updateClient = asyncHandler(async (req: any, res: Response) => {
    const client = await clientService.getActiveClientById(parseInt(req.params.id), req.user.id);

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

    const validatedData = updateClientSchema.parse(req.body);
    const updated = await clientService.updateClient(parseInt(req.params.id), req.user.id, validatedData);
    res.status(StatusCodes.OK).json({
        success: true,
        client: updated,
        message: 'Client updated successfully',
    });
});

export const restoreClient = async(req: any, res: Response) => {

    try {
    const ownerId = req.user.id;
    const clientId = parseInt(req.params.id);
    await clientService.restoreClient(clientId, ownerId);
    res.status(StatusCodes.OK).json({ success: true, message: 'Client restored' })
    }catch (err: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to restore client',
            error: err.message
        })

    }

}