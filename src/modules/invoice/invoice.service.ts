import { eq, and, SQL } from 'drizzle-orm';
import { db } from '../../config/db';
import { invoices } from '../../db/schema';
import { CreateInvoiceInput, UpdateInvoiceInput } from './invoice.schema';


export const getInvoicesByTeam = async (teamId: number | null, ownerId: string) => {
    const scope: SQL<unknown> = teamId === null
        ? eq(invoices.ownerId, ownerId)
        : eq(invoices.teamId, teamId)

    return db.select().from(invoices).where(scope);
};

export const getInvoiceById = async (id: number) => {
    const result = await db
        .select()
        .from(invoices)
        .where(eq(invoices.id, id));
    return result[0];
};

export const createInvoice = async (ownerId: string, teamId: number | null, data: CreateInvoiceInput) => {
    const [newInvoice] = await db
        .insert(invoices)
        .values({
            amount: data.amount.toString(),
            status: data.status || 'draft',
            dueDate: data.dueDate ? new Date(data.dueDate) : null,
            clientId: data.clientId,
            projectId: data.projectId || null,
            ownerId: ownerId,
            teamId: teamId,
        })
        .returning();
    return newInvoice;
};

export const updateInvoice = async (id: number, data: UpdateInvoiceInput) => {
    const updateData: any = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.paidAt) updateData.paidAt = new Date(data.paidAt);
    updateData.updatedAt = new Date();

    const [updated] = await db
        .update(invoices)
        .set(updateData)
        .where(eq(invoices.id, id))
        .returning();
    return updated;
};

export const deleteInvoice = async (id: number) => {
    return db.delete(invoices).where(eq(invoices.id, id));
};
