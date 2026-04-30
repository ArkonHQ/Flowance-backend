import { StatusCodes } from "http-status-codes";
import Client from "../models/client.model.js";


// @desc    GET a client
// @route   POST /api/v1/clients/:id
// @access  Private

export const getClient = async (req, res) => {
    const client = await Client.findById({
        owner:  req.user._id,
        id: req.params.id,
    })

    if (!client) return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Not Found',
    })

    res.status(StatusCodes.OK).json({
        status: true,
        data: client,
    });
}

// @desc    Create a client
// @route   POST /api/v1/clients
// @access  Private

export const createClient = async (req, res) => {
    const { email, company, name } = req.body

    try {

        // Create new company, name, and email
        const newClient = await Client.create({
            email,
            name,
            company,
            owner: req.user._id,
        })

        // If the user not exist then create one
        return res.status(StatusCodes.CREATED).json({
            status: true,
            data: newClient,
            message: "Client created successfully",
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(StatusCodes.CONFLICT).json({
                success: false,
                message: 'Client with this email already exists',
            })
        }
        console.error(error)
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Server error while creating client',
        })
    }
}

// @desc    GET clients
// @route   POST /api/v1/clients
// @access  Private

export const getClients = async (req, res) => {
    const clients = await Client.find({
        owner: req.user._id,
    })

    res.status(StatusCodes.OK).json({
        status: true,
        data: clients,
        count: clients.length
    });
}

// @desc    Delete a client
// @route   POST /api/v1/clients/:id
// @access  Private

export const deleteClient = async (req, res) => {

    const client = await Client.findOneAndDelete({
        owner: req.user._id,
        _id: req.params.id
    })

    if (!client) return res.status(StatusCodes.NOT_FOUND).json({
        status: false,
        message: `Client not found`,
    })

    res.status(StatusCodes.NOT_FOUND).json({
        success: true,
        message: `Client removed successfully`,
    })
}

// @desc    Update a client
// @route   POST /api/v1/clients/:id
// @access  Private

export const updateClient = async (req, res) => {
    const { email, name, company } = req.body;

    const updatedClient = await Client.findOneAndUpdate(
        { _id: req.params.id, owner: req.user._id },
        { email, name, company },
        { new: true, runValidators: true }
    );

    if (!updatedClient) {
        return res.status(StatusCodes.NOT_FOUND).json({
            success: false,
            message: 'Client not found',
        });
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: updatedClient,
        message: 'Client updated successfully',
    });
};
