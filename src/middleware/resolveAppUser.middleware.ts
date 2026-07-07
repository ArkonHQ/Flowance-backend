import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { db } from '../config/db';
import { users } from '../db/schema/tables/users';
import { eq } from 'drizzle-orm';

/**
 * Resolves the integer app `users.id` from the better-auth session user 
 * (which has a text/UUID id) by looking up via email, then attaches `req.appUserId`.
 * 
 * Must run AFTER `requireAuth` and BEFORE any middleware that needs the integer user id.
 */
export const resolveAppUser = async (req: Request, res: Response, next: NextFunction) => {
  const authUser = (req as any).user;
  if (!authUser?.email) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' });
  }

  // Already resolved in this request lifecycle
  if ((req as any).appUserId) {
    return next();
  }

  const [appUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, authUser.email))
    .limit(1);

  if (!appUser) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'User account not found' });
  }

  (req as any).appUserId = appUser.id;
  next();
};
