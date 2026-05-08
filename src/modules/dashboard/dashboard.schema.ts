import { z } from "zod";

export const earningsQuerySchema = z.object({
    period: z.enum(['week', 'month', 'year', 'all']).optional().default('month'),
});

export type EarningsQuery = z.infer<typeof earningsQuerySchema>;
