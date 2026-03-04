// ===========================================
// Middleware: Authentication (JWT)
// ===========================================

import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../shared/utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../../shared/errors/AppError';
import { UserRole } from '../../domain/entities/User';

export interface AuthenticatedRequest extends Request {
    userId?: string;
    userRole?: UserRole;
}

/**
 * Middleware: Verify JWT token
 */
export function authenticate(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new UnauthorizedError('Access token is required');
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = verifyAccessToken(token);
        req.userId = payload.userId;
        req.userRole = payload.role;
        next();
    } catch {
        throw new UnauthorizedError('Invalid or expired access token');
    }
}

/**
 * Middleware Factory: Authorize by role
 */
export function authorize(...allowedRoles: UserRole[]) {
    return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
        if (!req.userRole || !allowedRoles.includes(req.userRole)) {
            throw new ForbiddenError('You do not have permission to access this resource');
        }
        next();
    };
}
