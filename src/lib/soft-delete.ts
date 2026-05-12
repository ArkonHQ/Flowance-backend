import { db } from '../config/db'
import { clients, projects, invoices, tasks } from '../db/schema';
import { eq, isNull  } from 'drizzle-orm';


// Soft delete a client 
export const softDeleteClient = async (clientId: number, cascade: boolean = true) => {
    const now = new Date();

    // soft delete the client
    await db.update(clients)
    .set({ deletedAt:now, updatedAt: now})
    .where(eq(clients.id, clientId) )


    if (cascade){ 
        // Soft delete all projects of this client
        await db.update(projects)
            .set({ deletedAt:now, updatedAt: now})
            .where(eq(projects.clientId, clientId) )

        // soft delete all invoices of this client
        await db.update(invoices)
            .set({ deletedAt:now, updatedAt: now})
            .where(eq(invoices.clientId, clientId) )

    }

}

// Restore a client 
export const restoreDeletedClient = async (clientId: number, cascade: boolean = true) => {
    const now = new Date()
    await db.update(clients)
        .set({ deletedAt:null, updatedAt: now})
        .where(eq(clients.id, clientId) )


    if (cascade) {
        await db.update(projects)
            .set({ deletedAt:null, updatedAt: now})
            .where(eq(projects.clientId, clientId) )

        await db.update(invoices)
            .set({ deletedAt:null, updatedAt: now})
            .where(eq(invoices.clientId, clientId) )
    }



}