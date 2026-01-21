import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import authRoutes from '../presentation/routes/auth.routes';
import bookingRoutes from '../presentation/routes/booking.routes';
import businessRoutes from '../presentation/routes/business.routes';
import { errorHandler } from '../presentation/middlewares/errorHandler';
import { logger } from './utils/logger';

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: { status: 'error', message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

app.use((req, _res, next) => {
    logger.info({ method: req.method, url: req.url }, 'request');
    next();
});

app.get('/api/health', (_req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
    });
});

// swagger
const swaggerSpec = swaggerJsdoc({
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'SmartBooking API',
            version: '1.0.0',
            description: 'Booking management API for local businesses',
        },
        servers: [{ url: 'http://localhost:3000', description: 'Development' }],
        components: {
            securitySchemes: {
                bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/presentation/controllers/*.ts', './src/presentation/routes/*.ts'],
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'SmartBooking API Docs',
    customCss: '.swagger-ui .topbar { display: none }',
}));

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/businesses', businessRoutes);

app.use((_req, res) => {
    res.status(404).json({ status: 'error', message: 'Route not found' });
});

app.use(errorHandler);

export default app;
