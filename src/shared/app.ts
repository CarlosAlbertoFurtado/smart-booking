// ===========================================
// Express App Configuration
// ===========================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import authRoutes from '../presentation/routes/auth.routes';
import bookingRoutes from '../presentation/routes/booking.routes';
import { errorHandler } from '../presentation/middlewares/errorHandler';
import { logger } from './utils/logger';

const app = express();

// ---- Security Middlewares ----
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ---- Rate Limiting ----
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: { status: 'error', message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// ---- Request Logging ----
app.use((req, _res, next) => {
    logger.info({ method: req.method, url: req.url }, 'Incoming request');
    next();
});

// ---- Health Check ----
app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
    });
});

// ---- Swagger Documentation ----
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SmartBooking API',
            version: '1.0.0',
            description: '🗓️ Smart booking system for local businesses. Features: JWT/OAuth auth, RBAC, real-time WebSocket updates, AI scheduling suggestions, Redis caching.',
            contact: {
                name: 'Carlos Alberto Furtado',
                url: 'https://github.com/CarlosAlbertoFurtado',
            },
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Development' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/presentation/controllers/*.ts', './src/presentation/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'SmartBooking API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
}));

// ---- API Routes ----
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);

// ---- 404 Handler ----
app.use((_req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
    });
});

// ---- Global Error Handler ----
app.use(errorHandler);

export default app;
