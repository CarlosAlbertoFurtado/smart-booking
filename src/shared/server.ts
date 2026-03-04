// ===========================================
// Server Entry Point
// ===========================================

import 'dotenv/config';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { connectDatabase } from '../infrastructure/database/prisma';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT || '3000');
const server = http.createServer(app);

// ---- WebSocket Setup ----
const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'Client connected via WebSocket');

    // Join business room for real-time updates
    socket.on('join:business', (businessId: string) => {
        socket.join(`business:${businessId}`);
        logger.debug({ socketId: socket.id, businessId }, 'Client joined business room');
    });

    // Join professional room
    socket.on('join:professional', (professionalId: string) => {
        socket.join(`professional:${professionalId}`);
    });

    socket.on('disconnect', () => {
        logger.debug({ socketId: socket.id }, 'Client disconnected');
    });
});

// Make io accessible to controllers for emitting events
app.set('io', io);

// ---- Start Server ----
async function bootstrap(): Promise<void> {
    await connectDatabase();

    server.listen(PORT, () => {
        logger.info(`
    ╔══════════════════════════════════════════════╗
    ║                                              ║
    ║   🗓️  SmartBooking API is running!            ║
    ║                                              ║
    ║   🌐 Server:  http://localhost:${PORT}          ║
    ║   📚 Docs:    http://localhost:${PORT}/api/docs  ║
    ║   💚 Health:  http://localhost:${PORT}/api/health ║
    ║   🔌 WebSocket: ws://localhost:${PORT}           ║
    ║                                              ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}              ║
    ║                                              ║
    ╚══════════════════════════════════════════════╝
    `);
    });
}

// ---- Graceful Shutdown ----
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
});

process.on('unhandledRejection', (reason) => {
    logger.error(reason, 'Unhandled Rejection');
});

process.on('uncaughtException', (error) => {
    logger.fatal(error, 'Uncaught Exception');
    process.exit(1);
});

bootstrap().catch((error) => {
    logger.fatal(error, 'Failed to start server');
    process.exit(1);
});
