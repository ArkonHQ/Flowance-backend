import { Response } from "express";
import { StatusCodes } from 'http-status-codes';
import * as invoiceService from "./invoice.service";
import { asyncHandler } from "../../utils/asyncHandler";

export const getAllInvoices = asyncHandler(async (req: any, res: Response) => {
    const allInvoices = await invoiceService.getInvoicesByOwner(req.user.id);
    res.json({ success: true, invoices: allInvoices });
});

export const getOneInvoice = asyncHandler(async (req: any, res: Response) => {
    const invoice = await invoiceService.getInvoiceById(parseInt(req.params.id));

    if (!invoice) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Invoice not found' });
    }

    if (invoice.ownerId !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Not authorized' });
    }

    res.json({ success: true, invoice });
});

export const createInvoice = asyncHandler(async (req: any, res: Response) => {
    const newInvoice = await invoiceService.createInvoice(req.user.id, req.body);
    res.status(StatusCodes.CREATED).json({ success: true, invoice: newInvoice });
});

export const updateInvoice = asyncHandler(async (req: any, res: Response) => {
    const invoice = await invoiceService.getInvoiceById(parseInt(req.params.id));

    if (!invoice) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Invoice not found' });
    }

    if (invoice.ownerId !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Not authorized' });
    }

    const updated = await invoiceService.updateInvoice(parseInt(req.params.id), req.body);
    res.json({ success: true, invoice: updated });
});

export const deleteInvoice = asyncHandler(async (req: any, res: Response) => {
    const invoice = await invoiceService.getInvoiceById(parseInt(req.params.id));

    if (!invoice) {
        return res.status(StatusCodes.NOT_FOUND).json({ message: 'Invoice not found' });
    }

    if (invoice.ownerId !== req.user.id) {
        return res.status(StatusCodes.FORBIDDEN).json({ message: 'Not authorized' });
    }

    await invoiceService.deleteInvoice(parseInt(req.params.id));
    res.json({ success: true, message: 'Invoice deleted' });
});
