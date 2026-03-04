// ===========================================
// JWT Token Utilities
// ===========================================

import jwt from 'jsonwebtoken';
import { UserRole } from '../../domain/entities/User';

interface TokenPayload {
    userId: string;
    role: UserRole;
}

export function generateTokens(payload: TokenPayload): {
    accessToken: string;
    refreshToken: string;
} {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });

    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
}

export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as TokenPayload;
}
