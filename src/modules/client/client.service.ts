import { eq, and } from 'drizzle-orm';
import { db } from '../../config/db';
import { clients } from '../../db/schema';
import { CreateClientInput, UpdateClientInput } from './client.schema';

export const getClientsByOwner = async (ownerId: string) => {
    return db
        .select()
        .from(clients)
        .where(eq(clients.ownerId, ownerId));
};

export const getClientById = async (id: number) => {
    const result = await db
        .select()
        .from(clients)
        .where(eq(clients.id, id));
    return result[0];
};

export const createClient = async (ownerId: string, data: CreateClientInput) => {
    const [newClient] = await db
        .insert(clients)
        .values({
            name: data.name,
            email: data.email || null,
            company: data.company || null,
            ownerId: ownerId
        })
        .returning();
    return newClient;
};

export const deleteClient = async (id: number) => {
    const [deleted] = await db
        .delete(clients)
        .where(eq(clients.id, id))
        .returning();
    return deleted;
};

export const updateClient = async (id: number, data: UpdateClientInput) => {
    const [updated] = await db
        .update(clients)
        .set({
            ...data,
            updatedAt: new Date(),
        })
        .where(eq(clients.id, id))
        .returning();
    return updated;
};
