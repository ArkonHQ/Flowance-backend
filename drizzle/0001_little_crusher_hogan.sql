CREATE OR REPLACE VIEW client_insights AS
SELECT
    c.id,
    c.owner_id,
    c.name,
    COUNT(DISTINCT p.id)::int AS total_projects,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.amount ELSE 0 END), 0) AS total_earned,
    COALESCE(SUM(CASE WHEN i.status IN ('sent', 'overdue') THEN i.amount ELSE 0 END), 0) AS unpaid_amount,
    COALESCE(ROUND(AVG(CASE WHEN i.status = 'paid' THEN EXTRACT(EPOCH FROM (i.paid_at - i.due_date)) / 86400 END)::numeric, 2), 0) AS avg_payment_delay_days,
    CASE
        WHEN COALESCE(AVG(CASE WHEN i.status = 'paid' THEN EXTRACT(EPOCH FROM (i.paid_at - i.due_date)) / 86400 END), 0) > 30 THEN 'high'
        WHEN COALESCE(SUM(CASE WHEN i.status IN ('sent', 'overdue') THEN 1 ELSE 0 END), 0) > 0 THEN 'medium'
        ELSE 'low'
        END AS risk_level
FROM clients c
         LEFT JOIN projects p ON p.client_id = c.id
         LEFT JOIN invoices i ON i.client_id = c.id
GROUP BY c.id, c.owner_id, c.name;