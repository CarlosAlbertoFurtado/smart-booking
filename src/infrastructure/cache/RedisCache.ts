import Redis from 'ioredis';
import { ICacheService } from '../../domain/interfaces/repositories';
import { logger } from '../../shared/utils/logger';

export class RedisCacheService implements ICacheService {
    private client: Redis;

    constructor() {
        this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
            maxRetriesPerRequest: 3,
            retryStrategy(times) {
                return Math.min(times * 50, 2000);
            },
        });

        this.client.on('connect', () => logger.info('redis_connected'));
        this.client.on('error', (err) => logger.error(err, 'redis_error'));
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
        await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
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
