import { Response, Request, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import jwt  from "jsonwebtoken";


export const authenticate = (req: Request, res: Response, next: NextFunction) => {

  const token = req.cookies?.auth_token   // cookie name 
  if (!token) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Authentication required' })
  }
  
  try {
    
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as ({ sub: string })
    (req as any).userId = payload.sub
    next()

  } catch (error: any) {
    return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Invalid authentication token'})
  }

}