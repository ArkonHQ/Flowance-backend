import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(1, 'Name required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type RegisteredInput = z.infer<typeof registerSchema>