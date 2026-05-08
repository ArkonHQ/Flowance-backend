
declare namespace Express {
    interface Request {
        user?: {
            id: number;
            name: string;
            email: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }
}

// 2. Define the shape of your JWT payload
interface JwtPayload {
    id: number;
}