// ===========================================
// Infrastructure: Prisma Database Connection
// ===========================================

import { PrismaClient } from '@prisma/client';
import { logger } from '../../shared/utils/logger';

const prisma = new PrismaClient({
    log:
        process.env.NODE_ENV === 'development'
            ? [
                { level: 'query', emit: 'event' },
                { level: 'error', emit: 'stdout' },
            ]
            : [{ level: 'error', emit: 'stdout' }],
});

if (process.env.NODE_ENV === 'development') {
    prisma.$on('query' as never, (e: { query: string; duration: number }) => {
        logger.debug({ query: e.query, duration: `${e.duration}ms` }, 'Database query');
    });
}

export async function connectDatabase(): Promise<void> {
    try {
        await prisma.$connect();
        logger.info('✅ Database connected successfully');
    } catch (error) {
        logger.error(error, '❌ Failed to connect to database');
        process.exit(1);
    }
}

export async function disconnectDatabase(): Promise<void> {
    await prisma.$disconnect();
    logger.info('Database disconnected');
}

export default prisma;
