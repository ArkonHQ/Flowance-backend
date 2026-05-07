import { db } from '../config/db.ts'
import { invoices } from "../db/tables/invoices.ts" 
import { eq } from 'drizzle-orm' 

export const getAllInvoices = async (req, res) => {
    try {
        const allInvoices = await db
            .select()
            .from(invoices)
            .where(eq(invoices.ownerId, req.user.id)) 

        res.json({ success: true, invoices: allInvoices }) 
    } catch (error) {
        console.error('Get invoices error:', error) 
        res.status(500).json({ message: 'Server error' }) 
    }
} 

export const getOneInvoice = async (req, res) => {
    try {
        const result = await db
            .select()
            .from(invoices)
            .where(eq(invoices.id, parseInt(req.params.id)))

        const invoice = result[0]

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' })
        }

        if (invoice.ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' })
        }

        res.json({ success: true, invoice })
    } catch (error) {
        console.error('Get one invoice error:', error)
        res.status(500).json({ message: 'Server error' })
    }
}

export const createInvoice = async (req, res) => {
    const { amount, status, dueDate, clientId, projectId } = req.body 

    try {
        const [newInvoice] = await db
            .insert(invoices)
            .values({
                amount: amount.toString(),
                status: status || 'draft',
                dueDate: dueDate ? new Date(dueDate) : null,
                clientId: parseInt(clientId),
                projectId: projectId ? parseInt(projectId) : null,
                ownerId: req.user.id,
            })
            .returning() 

        res.status(201).json({ success: true, invoice: newInvoice }) 
    } catch (error) {
        console.error('Create invoice error:', error) 
        res.status(500).json({ message: 'Server error' }) 
    }
} 

export const updateInvoice = async (req, res) => {
    const { amount, status, dueDate, paidAt } = req.body 

    try {
        const existing = await db
            .select()
            .from(invoices)
            .where(eq(invoices.id, parseInt(req.params.id))) 

        if (!existing[0]) {
            return res.status(404).json({ message: 'Invoice not found' }) 
        }

        if (existing[0].ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' }) 
        }

        const [updated] = await db
            .update(invoices)
            .set({
                amount: amount || existing[0].amount,
                status: status || existing[0].status,
                dueDate: dueDate ? new Date(dueDate) : existing[0].dueDate,
                paidAt: paidAt ? new Date(paidAt) : existing[0].paidAt,
                updatedAt: new Date(),
            })
            .where(eq(invoices.id, parseInt(req.params.id)))
            .returning() 

        res.json({ success: true, invoice: updated }) 
    } catch (error) {
        console.error('Update invoice error:', error) 
        res.status(500).json({ message: 'Server error' }) 
    }
} 

export const deleteInvoice = async (req, res) => {
    try {
        const existing = await db
            .select()
            .from(invoices)
            .where(eq(invoices.id, parseInt(req.params.id))) 

        if (!existing[0]) {
            return res.status(404).json({ message: 'Invoice not found' }) 
        }

        if (existing[0].ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' }) 
        }

        await db.delete(invoices).where(eq(invoices.id, parseInt(req.params.id))) 

        res.json({ success: true, message: 'Invoice deleted' }) 
    } catch (error) {
        console.error('Delete invoice error:', error) 
        res.status(500).json({ message: 'Server error' }) 
    }
} 