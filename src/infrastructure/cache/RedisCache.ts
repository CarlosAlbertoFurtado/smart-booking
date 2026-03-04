// ===========================================
// Infrastructure: Redis Cache Service
// ===========================================

import Redis from 'ioredis';
import { ICacheService } from '../../domain/interfaces/repositories';
import { logger } from '../../shared/utils/logger';

export class RedisCacheService implements ICacheService {
    private client: Redis;

    constructor() {
        this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });

        this.client.on('connect', () => {
            logger.info('✅ Redis connected successfully');
        });

        this.client.on('error', (err) => {
            logger.error(err, '❌ Redis connection error');
        });
    }

    async get<T>(key: string): Promise<T | null> {
        const data = await this.client.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data) as T;
        } catch {
            return data as unknown as T;
        }
    }

    async set(key: string, value: unknown, ttlSeconds: number = 3600): Promise<void> {
        const serialized = JSON.stringify(value);
        await this.client.set(key, serialized, 'EX', ttlSeconds);
    }

    async delete(key: string): Promise<void> {
        await this.client.del(key);
    }

    async deletePattern(pattern: string): Promise<void> {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
            await this.client.del(...keys);
        }
    }

    async disconnect(): Promise<void> {
        await this.client.quit();
    }

    getClient(): Redis {
        return this.client;
    }
}
