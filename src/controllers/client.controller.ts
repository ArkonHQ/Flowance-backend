import { StatusCodes } from "http-status-codes";
import { db } from "../config/db.ts"
import { clients } from "../db/tables/clients.ts";
import { eq } from 'drizzle-orm'


// @desc    GET clients
// @route   POST /api/v1/clients
// @access  Private

export const getClients = async (req, res) => {
    try {
        const allClients = await db
            .select()
            .from(clients)
            .where(eq(clients.ownerId, req.user.id))

        res.status(StatusCodes.OK).json({
            status: true,
            clients: allClients,
            count: allClients.length
        });

    }catch(err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            status: false,
            error: err.message,
            message: 'Oops! Something went wrong.'
        })
    }
}


// ---------------------------------------
// @desc    GET a client
// @route   POST /api/v1/clients/:id
// @access  Private
// ---------------------------------------
export const getClient = async (req, res) => {
    try {

        const result = await db
            .select()
            .from(clients)
            .where(eq(clients.id, parseInt(req.params.id)))

        const client = result[0]

        if (!client) return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Not Found',
        })

        // Verify ownership
        if (client.ownerId !== req.user.id) return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Not authorized',
        })

    res.status(StatusCodes.OK).json({
        status: true,
        client,
    });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Internal Server Error',
            error: err.message,
        })
    }
}

// @desc    Create a client
// @route   POST /api/v1/clients
// @access  Private

export const createClient = async (req, res) => {
    const { email, company, name } = req.body

    try {

        // Create new company, name, and email
        const [newClient] = await db
            .insert(clients)
            .values({
                name,
                email: email || null,
                company: company || null,
                ownerId: req.user.id
            })
            .returning();

        return res.status(StatusCodes.CREATED).json({
            status: true,
            client: newClient,
            message: "Client created successfully",
        });

    } catch (error) {
        console.error(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Server error while creating client',
        })
    }
}


// @desc    Delete a client
// @route   POST /api/v1/clients/:id
// @access  Private

export const deleteClient = async (req, res) => {

    try {

        // Check ownership
        const existing = await db
            .select()
            .from(clients)
            .where(eq(clients.id, parseInt(req.params.id)))

        if (!existing[0]) return res.status(StatusCodes.NOT_FOUND).json({
            status: false,
            message: `Client not found`,
        })

        if (existing[0].ownerId !== req.user.id) return res.status(StatusCodes.FORBIDDEN).json({
            status: false,
            message: `Not authorized`,
        })

        const [deleted] = await db
            .delete(clients)
            .where(eq(clients.id, parseInt(req.params.id)))
            .returning()

        res.json({
            status: true,
            message: `Client deleted successfully`,
            client: deleted
        })


    }catch(err) {
        console.error('Delete client error:', err)
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: err.message,
            message: 'Oops! Something went wrong.',
        })
    }


}

// @desc    Update a client
// @route   POST /api/v1/clients/:id
// @access  Private

export const updateClient = async (req, res) => {
    const { email, name, company } = req.body;

    try {
        const existing = await db
            .select()
            .from(clients)
            .where(eq(clients.id, parseInt(req.params.id)))

        if (!existing[0]) {
            return res.status(StatusCodes.NOT_FOUND).json({
                success: false,
                message: 'Client not found',
            });
        }

        if (existing[0].ownerId !== req.user.id) return res.status(StatusCodes.FORBIDDEN).json({
            success: false,
            message: 'Not authorized',
        })

        const [updated] = await db
            .update(clients)
            .set({
                name: name || existing[0].name,
                email: email !== undefined ? email : existing[0].email,
                company: company !== undefined ? company : existing[0].company,
                updatedAt: new Date(),
            })
            .where(eq(clients.id, parseInt(req.params.id)))
            .returning();



        res.status(StatusCodes.OK).json({
            success: true,
            client: updated,
            message: 'Client updated successfully',
        });

    }catch(err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Server error',
            err: err.message,
        })
    }
};


