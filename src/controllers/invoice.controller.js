import { StatusCodes } from "http-status-codes";
import Invoice from "../models/invoice.model.js";


export const getAllInvoices = async (req, res) => {
    const invoices = await Invoices.find({ owner: req.user.id })
        .sort({ createdAt: -1 })
        .populate( 'client', 'name company' )
    res.status(StatusCodes.OK).json({
        success: true,
        count: invoices.length,
        data: invoices,
    });
}

export const getOneInvoice = async (req, res) => {
    const invoice = await Invoice.findOne({
        _id: req.params.id,
        owner: req.user._id,
    })
        .populate( 'client', 'name company' )

    if (!invoice) res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Invoice not found',
    })

    res.status(StatusCodes.OK).json({
        success: true,
        data: invoice,
    })
}

export const updateInvoice = async (req, res) => {
    const updated = await Invoice.findOneAndUpdate(
        { _id: req.user.id,  owner: req.user._id },
        { client, project, amount, status, paidAt, dueDate },
        { new: true, runValidators: true }
    )

    if ( !updated ) res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Update invoice failed',
    })
}

export const createInvoice = async (req, res) => {
    const { client, project, status, paidAt, dueDate, amount } = req.body

     const invoice = await Invoice.create({
        client, project, status, paidAt, dueDate, amount,
        owner: req.user._id,
    })

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: 'Invoice created',
        data: invoice,
    })
}

export const deleteInvoice = async (req, res) => {
    const invoice = await Invioce.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

    if (!invoice) res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Delete invoice failed',
    })

    res.status(StatusCodes.OK).json({
        success: true,
        data: {},
        message: 'Invoice removed',
    })
}