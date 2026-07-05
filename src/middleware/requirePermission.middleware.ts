import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

type Permission = 'project:write' | 'project:read' | 'team:manage' | 'member:invite' | 'member:remove' | 'task:write' | 'task:read' | 'invoice:read' | 'invoice:write' | 'dashboard:read'


const permissionMap: Record<Permission, string[]> = {
  'project:read': ['admin', 'member', 'owner'],
  'project:write': ['admin', 'owner'],
  'team:manage': ['admin', 'owner'],
  'member:invite': ['admin', 'owner'],
  'member:remove': ['admin', 'owner'],
  'task:read': ['admin', 'member', 'owner'],
  'task:write': ['admin', 'owner'],
  'invoice:read': ['admin', 'member', 'owner'],
  'invoice:write': ['admin', 'owner'],
  'dashboard:read': ['admin', 'member', 'owner']
}


export const requirePermission = (permission: Permission) => {
  return (req: Request, res: Response, next: NextFunction) => {
  
  const ctx = (req as any).teamContext
  if (!ctx) return res.status(StatusCodes.FORBIDDEN).json({ message: 'Team context is missing'})

  
  // Compute effective role: owner if they own the team otherwise their membership role
  const effectiveRole = ctx.isOwner ? 'owner' : ctx.role

  // Check if the effective role has permission
  const allowedRoles = permissionMap[permission]
  if (!allowedRoles.includes(effectiveRole)) return res.status(StatusCodes.FORBIDDEN).json({ message: 'You do not have permission to perform this action'})
    
  next()
  }
}