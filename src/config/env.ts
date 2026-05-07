import dotenv from 'dotenv';

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
dotenv.config(); // Fallback to .env if needed



export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const DATABASE_URL = process.env.DATABASE_URL;
export const {
    PORT,
    JWT_EXPIRES_IN,
} = process.env