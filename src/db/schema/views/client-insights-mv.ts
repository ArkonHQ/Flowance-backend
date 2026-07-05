import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { sql, eq, isNull } from 'drizzle-orm';
import { clients, projects, invoices } from '../tables';

export const clientInsightsMv = pgMaterializedView('client_insights_mv').as((qb) => {
  return qb
    .select({
      id: clients.id,
      ownerId: clients.ownerId,
      teamId: clients.teamId,
      name: clients.name,
      totalProjects: sql<number>`COUNT(DISTINCT CASE WHEN ${projects.deletedAt} IS NULL THEN ${projects.id} END)::int`.as('total_projects'),
      totalEarned: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} = 'paid' AND ${invoices.deletedAt} IS NULL THEN ${invoices.amount} ELSE 0 END), 0)`.as('total_earned'),
      unpaidAmount: sql<number>`COALESCE(SUM(CASE WHEN ${invoices.status} IN ('sent', 'overdue') AND ${invoices.deletedAt} IS NULL THEN ${invoices.amount} ELSE 0 END), 0)`.as('unpaid_amount'),
      avgPaymentDelayDays: sql<number>`COALESCE(ROUND(AVG(CASE WHEN ${invoices.status} = 'paid' AND ${invoices.deletedAt} IS NULL THEN EXTRACT(EPOCH FROM (${invoices.paidAt} - ${invoices.dueDate})) / 86400 END)::numeric, 2), 0)`.as('avg_payment_delay_days'),
      riskLevel: sql<string>`CASE
        WHEN COALESCE(AVG(CASE WHEN ${invoices.status} = 'paid' AND ${invoices.deletedAt} IS NULL THEN EXTRACT(EPOCH FROM (${invoices.paidAt} - ${invoices.dueDate})) / 86400 END), 0) > 30 THEN 'high'
        WHEN COALESCE(SUM(CASE WHEN ${invoices.status} IN ('sent', 'overdue') AND ${invoices.deletedAt} IS NULL THEN 1 ELSE 0 END), 0) > 0 THEN 'medium'
        ELSE 'low'
      END`.as('risk_level'),
      status: clients.status,
      lastActivity: sql<Date>`MAX(
      GREATEST(
        COALESCE(${projects.updatedAt}, '1970-01-01'),
        COALESCE(${invoices.createdAt}, '1970-01-01'),
      ))`.as('last_activity'),
    })
    .from(clients)
    .leftJoin(projects, eq(projects.clientId, clients.id))
    .leftJoin(invoices, eq(invoices.clientId, clients.id))
    .where(isNull(clients.deletedAt))
    .groupBy(clients.id, clients.ownerId, clients.teamId, clients.name, clients.status);
});