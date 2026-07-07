import { eq, and, sql, isNull, SQL } from 'drizzle-orm';
import { db } from '../../config/db';
import { clients, projects, invoices } from '../../db/schema';
import { softDeleteClient } from '../../lib/soft-delete';
import { restoreDeletedClient } from '../../lib/soft-delete';
import { clientInsightsMv } from '../../db/schema/views/client-insights-mv';


// Helper: scope query by team or by owner (personal workspace)
const teamScope = (teamId: number | null, ownerId: string): SQL<unknown> => {
    if (teamId === null) return eq(clients.ownerId, ownerId)
    return eq(clients.teamId, teamId)
}


export const clientService = {

    // Get all active clients for a specific user and team
    async getActiveClients(teamId: number | null, ownerId: string) {
        const scope = teamId === null
            ? eq(clients.ownerId, ownerId)
            : eq(clients.teamId, teamId)

        return await db
            .select()
            .from(clients)
            .where(and(scope, isNull(clients.deletedAt)))
            .orderBy(clients.name)
    },

    // Get a single active client with details and statistics by ID
    async getActiveClientById(clientId: number, teamId: number | null, ownerId: string) {
        const scope = teamId === null
            ? eq(clients.ownerId, ownerId)
            : eq(clients.teamId, teamId)

        const [client] = await db
            .select()
            .from(clients)
            .where(and(eq(clients.id, clientId), scope, isNull(clients.deletedAt)))

        return client;
    },

    // Get client insights by ID or all active client insights for the team
    async getClientInsight(clientId: number | undefined, teamId: number | null, ownerId: string) {
        if (clientId === undefined || isNaN(clientId)) {
            // Personal workspace: no teamId, filter the view by ownerId
            if (teamId === null) {
                return await db.select().from(clientInsightsMv).where(eq(clientInsightsMv.ownerId, ownerId));
            }
            return await db.select().from(clientInsightsMv).where(eq(clientInsightsMv.teamId, teamId));
        }

        // Single insight no teamId filter needed for personal since we verify clientId ownership above
        const insight = await db
            .select()
            .from(clientInsightsMv)
            .where(eq(clientInsightsMv.id, clientId))
            .then(rows => rows[0]);

        return insight;
    },

    // Create a new client
    async createClient(data: {name: string; email?: string; company?: string; ownerId: string; teamId: number | null; }) {
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
    async updateClient(clientId: number, teamId: number | null, ownerId: string, data: Partial<{name: string; email?: string; company?: string;}>) {
        const scope = teamId === null
            ? eq(clients.ownerId, ownerId)
            : eq(clients.teamId, teamId)

        const [updated] = await db
            .update(clients)
            .set({ ...data, updatedAt: new Date() })
            .where(and(eq(clients.id, clientId), scope, isNull(clients.deletedAt)))
            .returning()

        return updated
    },

    // Soft delete a client (cascade to projects/invoices)
    async deleteClient(clientId: number, teamId: number | null, ownerId: string) {
        const client = await this.getActiveClientById(clientId, teamId, ownerId)
        if (!client) throw new Error('Client not found or already deleted')

        await softDeleteClient(clientId, true)
        return { success: true, message: 'Client deleted successfully' }
    },

    // Restore client (cascade restore projects/invoices)
    async restoreClient(clientId: number, teamId: number | null, ownerId: string) {
        const scope = teamId === null
            ? eq(clients.ownerId, ownerId)
            : eq(clients.teamId, teamId)

        const [client] = await db
            .select()
            .from(clients)
            .where(and(eq(clients.id, clientId), scope, sql`${clients.deletedAt} IS NOT NULL`))

        if (!client) throw new Error('Client not found or already active')

        await restoreDeletedClient(clientId, true)
        return { success: true, message: 'Client restored successfully' }
    }
}