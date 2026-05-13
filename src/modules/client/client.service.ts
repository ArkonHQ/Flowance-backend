import { eq, and, sql, isNull } from 'drizzle-orm';
import { db } from '../../config/db';
import { clients, projects, invoices } from '../../db/schema';
import { softDeleteClient } from '../../lib/soft-delete';
import { restoreDeletedClient } from '../../lib/soft-delete';


export const clientService = {

    // Get all active clients for a specific user
    async getActiveClients(ownerId: number) {
        return await db
            .select()
            .from(clients)
            .where(and(
                eq(clients.ownerId, ownerId),
                isNull(clients.deletedAt)
            )
        )
        .orderBy(clients.name)
    },

    // Get a single active client with details and statistics by ID
    async getActiveClientById(clientId: number, ownerId: number) {
      const [client] = await db
        .select()
        .from(clients)
        .where(
            and(eq(clients.id, clientId),
            eq(clients.ownerId, ownerId),
            isNull(clients.deletedAt)
            )
        )
    return client;
    },

    // Create a new client
    async createClient(data: {name: string; email?: string; company?: string; ownerId: number;  }) {
        const [newClient] = await db
            .insert(clients)
            .values({
                name: data.name,
                email: data.email,
                company: data.company,
                ownerId: data.ownerId,
                createdAt: new Date(),
                updatedAt: new Date()
            })
            .returning()
        
        return newClient
    },

    // Update an existing client
    async updateClient(clientId: number, ownerId: number, data: Partial<{name: string; email?: string; company?: string;   }>) {
        const [updated] = await db
            .update(clients)
            .set({ ...data, updatedAt: new Date() })
            .where(
                and(
                    eq(clients.id, clientId),
                    eq(clients.ownerId, ownerId),
                    isNull(clients.deletedAt)
                )
            )
            .returning()
        return updated
    },

    // soft delete a client (cascade to projects/invoices)
    async deleteClient(clientId: number, ownerId: number) {
        
        // Verify if client belongs to the owner
        const client = await this.getActiveClientById(clientId, ownerId)
        if(!client) throw new Error('Client not found or already deleted')

        await softDeleteClient(clientId, true)
        return { success: true, message: 'Client deleted successfully' }
            
    },

    // Restore client (cascade restore projects/invoices)
    async restoreClient(clientId: number, ownerId: number) {

        const [client] = await db
            .select()
            .from(clients)
            .where(
                and(
                    eq(clients.id, clientId),
                    eq(clients.ownerId, ownerId),
                    sql`${clients.deletedAt} IS NOT NULL`
                )
            )
        if (!client) throw new Error ('Client not found or already active')

        await restoreDeletedClient(clientId, true)
        return { success: true, message: 'Client restored successfully' }
    }
}