import jwt from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from '../../config/db';
import { users } from '../../db/schema';
import { JWT_EXPIRES_IN, JWT_SECRET } from "../../config/env";
import { RegisterInput, LoginInput } from './auth.schema';

export const generateToken = (user: { id: string }) => {
    return jwt.sign(
        { id: user.id },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN || '30d' }
    );
};

export const findUserByEmail = async (email: string) => {
    const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
    return result[0];
};

export const findUserById = async (id: string) => {
    const result = await db
        .select({
            id: users.id,
            name: users.name,
            email: users.email,
            createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, id));
    return result[0];
};

export const createUser = async (data: RegisterInput) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const [newUser] = await db
        .insert(users)
        .values({
            name: data.name,
            email: data.email,
            password: hashedPassword,
        })
        .returning();
    
    return newUser;
};

export const verifyPassword = async (password: string, hash: string) => {
    return bcrypt.compare(password, hash);
};
