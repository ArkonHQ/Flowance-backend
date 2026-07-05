import { eq, and, sql, isNull } from 'drizzle-orm';
import { db } from '../../config/db';
import { clients, projects, invoices } from '../../db/schema';
import { softDeleteClient } from '../../lib/soft-delete';
import { restoreDeletedClient } from '../../lib/soft-delete';
import { clientInsightsMv } from '../../db/schema/views/client-insights-mv';
import { StatusCodes } from 'http-status-codes';


export const clientService = {

    // Get all active clients for a specific user and team
    async getActiveClients(teamId: number, ownerId: string) {
        return await db
            .select()
            .from(clients)
            .where(and(
                eq(clients.teamId, teamId),
                isNull(clients.deletedAt)
            )
        )
        .orderBy(clients.name)
    },

    // Get a single active client with details and statistics by ID
    async getActiveClientById(clientId: number, teamId: number, ownerId: string) {
      const [client] = await db
        .select()
        .from(clients)
        .where(
            and(eq(clients.id, clientId),
            eq(clients.teamId, teamId),
            isNull(clients.deletedAt)
            )
        )
    return client;
    },

    // Get client insights by ID or all active client insights for the team
    async getClientInsight(clientId: number | undefined, teamId: number, ownerId: string) {
        if (clientId === undefined || isNaN(clientId)) {
            // Get all insights for this team
            return await db
                .select()
                .from(clientInsightsMv)
                .where(eq(clientInsightsMv.teamId, teamId));
        }

        // Get single insight secure by teamId
        const insight = await db
            .select()
            .from(clientInsightsMv)
            .where(and(
                eq(clientInsightsMv.id, clientId),
                eq(clientInsightsMv.teamId, teamId)
            ))
            .then(rows => rows[0]);
        
        return insight;
    },

    // Create a new client
    async createClient(data: {name: string; email?: string; company?: string; ownerId: string; teamId: number; }) {
        const [newClient] = await db
            .insert(clients)
            .values({
                name: data.name,
                email: data.email || null,
                company: data.company || null,
                ownerId: data.ownerId,
                teamId: data.teamId,
            })
            .returning();
        
        return newClient;
    },

    // Update an existing client
    async updateClient(clientId: number, teamId: number, ownerId: string, data: Partial<{name: string; email?: string; company?: string;   }>) {
        const [updated] = await db
            .update(clients)
            .set({ ...data, updatedAt: new Date() })
            .where(
                and(
                    eq(clients.id, clientId),
                    eq(clients.teamId, teamId),
                    isNull(clients.deletedAt)
                )
            )
            .returning()
        return updated
    },

    // soft delete a client (cascade to projects/invoices)
    async deleteClient(clientId: number, teamId: number, ownerId: string) {
        
        // Verify if client belongs to the team
        const client = await this.getActiveClientById(clientId, teamId, ownerId)
        if(!client) throw new Error('Client not found or already deleted')

        await softDeleteClient(clientId, true)
        return { success: true, message: 'Client deleted successfully' }
            
    },

    // Restore client (cascade restore projects/invoices)
    async restoreClient(clientId: number, teamId: number, ownerId: string) {

        const [client] = await db
            .select()
            .from(clients)
            .where(
                and(
                    eq(clients.id, clientId),
                    eq(clients.teamId, teamId),
                    sql`${clients.deletedAt} IS NOT NULL`
                )
            )
        if (!client) throw new Error ('Client not found or already active')

        await restoreDeletedClient(clientId, true)
        return { success: true, message: 'Client restored successfully' }
    }
}