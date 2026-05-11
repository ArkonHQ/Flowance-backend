import { pgMaterializedView } from 'drizzle-orm/pg-core';
import { sql, eq } from 'drizzle-orm';
import { clients, projects, invoices } from '../tables';

export const clientInsightsMv = pgMaterializedView('client_insights_mv').as((qb) => {
  return qb
    .select({
      id: clients.id,
      ownerId: clients.ownerId,
      name: clients.name,
      totalProjects: sql<number>`count(distinct ${projects.id})::int`.as('total_projects'),
      totalEarned: sql<number>`coalesce(sum(case when ${invoices.status} = 'paid' then ${invoices.amount} else 0 end), 0)`.as('total_earned'),
      unpaidAmount: sql<number>`coalesce(sum(case when ${invoices.status} in ('sent', 'overdue') then ${invoices.amount} else 0 end), 0)`.as('unpaid_amount'),
      avgPaymentDelayDays: sql<number>`coalesce(round(avg(case when ${invoices.status} = 'paid' then extract(epoch from (${invoices.paidAt} - ${invoices.dueDate})) / 86400 end)::numeric, 2), 0)`.as('avg_payment_delay_days'),
      riskLevel: sql<string>`case
        when coalesce(avg(case when ${invoices.status} = 'paid' then extract(epoch from (${invoices.paidAt} - ${invoices.dueDate})) / 86400 end), 0) > 30 then 'high'
        when coalesce(sum(case when ${invoices.status} in ('sent', 'overdue') then 1 else 0 end), 0) > 0 then 'medium'
        else 'low'
      end`.as('risk_level')
    })
    .from(clients)
    .leftJoin(projects, eq(projects.clientId, clients.id))
    .leftJoin(invoices, eq(invoices.clientId, clients.id))
    .groupBy(clients.id, clients.ownerId, clients.name);
});
