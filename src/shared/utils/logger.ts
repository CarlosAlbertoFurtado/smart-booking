// ===========================================
// Pino Logger Configuration
// Structured logging for production
// ===========================================

import pino from 'pino';

export const logger = pino({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
        process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
                    ignore: 'pid,hostname',
                },
            }
            : undefined,
    base: {
        service: 'smart-booking',
        env: process.env.NODE_ENV,
    },
});
