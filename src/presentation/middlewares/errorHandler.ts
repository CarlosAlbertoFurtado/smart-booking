import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../../shared/errors/AppError';
import { ZodError } from 'zod';
import { logger } from '../../shared/utils/logger';

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
): void {
    logger.error({
        name: err.name,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });

    if (err instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        err.errors.forEach((e) => {
            const path = e.path.join('.');
            if (!errors[path]) errors[path] = [];
            errors[path].push(e.message);
        });

        res.status(422).json({ status: 'error', message: 'Validation failed', errors });
        return;
    }

    if (err instanceof ValidationError) {
        res.status(err.statusCode).json({ status: 'error', message: err.message, errors: err.errors });
        return;
    }

    if (err instanceof AppError) {
        res.status(err.statusCode).json({ status: 'error', message: err.message });
        return;
    }

    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { debug: err.message }),
    });
}
