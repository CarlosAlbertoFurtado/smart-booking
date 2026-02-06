import express from 'express';
import request from 'supertest';
import helmet from 'helmet';

/**
 * Integration tests — verify Express middleware stack in isolation.
 *
 * We build a small app that mirrors the real setup (helmet, JSON parsing,
 * error handler, health endpoint) WITHOUT importing Prisma or Redis,
 * so these tests can run anywhere without external services.
 */

function buildTestApp() {
    const app = express();

    app.use(helmet());
    app.use(express.json());

    app.get('/api/health', (_req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });

    app.post('/api/echo', (req, res) => {
        res.status(200).json({ received: req.body });
    });

    app.use((_req, res) => {
        res.status(404).json({ status: 'error', message: 'Route not found' });
    });

    // global error handler
    app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        res.status(500).json({ status: 'error', message: err.message });
    });

    return app;
}

describe('API Integration', () => {
    const app = buildTestApp();

    describe('GET /api/health', () => {
        it('returns 200 with status ok', async () => {
            const res = await request(app).get('/api/health');

            expect(res.status).toBe(200);
            expect(res.body.status).toBe('ok');
            expect(res.body).toHaveProperty('timestamp');
            expect(res.body).toHaveProperty('uptime');
        });

        it('returns valid ISO timestamp', async () => {
            const res = await request(app).get('/api/health');
            const date = new Date(res.body.timestamp);

            expect(date.getTime()).not.toBeNaN();
        });
    });

    describe('404 handler', () => {
        it('returns 404 for unknown GET routes', async () => {
            const res = await request(app).get('/api/nonexistent');

            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Route not found');
        });

        it('returns 404 for unknown POST routes', async () => {
            const res = await request(app).post('/api/unknown').send({});

            expect(res.status).toBe(404);
        });
    });

    describe('JSON body parsing', () => {
        it('parses JSON body correctly', async () => {
            const payload = { name: 'Carlos', role: 'developer' };
            const res = await request(app)
                .post('/api/echo')
                .send(payload)
                .set('Content-Type', 'application/json');

            expect(res.status).toBe(200);
            expect(res.body.received).toEqual(payload);
        });

        it('handles empty body gracefully', async () => {
            const res = await request(app)
                .post('/api/echo')
                .send({});

            expect(res.status).toBe(200);
            expect(res.body.received).toEqual({});
        });
    });

    describe('Security headers (Helmet)', () => {
        it('sets X-Content-Type-Options', async () => {
            const res = await request(app).get('/api/health');

            expect(res.headers['x-content-type-options']).toBe('nosniff');
        });

        it('sets X-Frame-Options', async () => {
            const res = await request(app).get('/api/health');

            expect(res.headers).toHaveProperty('x-frame-options');
        });

        it('removes X-Powered-By header', async () => {
            const res = await request(app).get('/api/health');

            expect(res.headers).not.toHaveProperty('x-powered-by');
        });
    });
});
