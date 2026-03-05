import 'dotenv/config';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { connectDatabase } from '../infrastructure/database/prisma';
import { logger } from './utils/logger';

const PORT = parseInt(process.env.PORT || '3000');
const server = http.createServer(app);

const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
    },
});

io.on('connection', (socket) => {
    logger.info({ socketId: socket.id }, 'ws_connected');

    socket.on('join:business', (businessId: string) => {
        socket.join(`business:${businessId}`);
    });

    socket.on('join:professional', (professionalId: string) => {
        socket.join(`professional:${professionalId}`);
    });

    socket.on('disconnect', () => {
        logger.debug({ socketId: socket.id }, 'ws_disconnected');
    });
});

app.set('io', io);

async function bootstrap(): Promise<void> {
    await connectDatabase();

    server.listen(PORT, () => {
        logger.info({ port: PORT, env: process.env.NODE_ENV }, 'server_started');
    });
}

process.on('SIGTERM', async () => {
    logger.info('sigterm_received');
    server.close(() => process.exit(0));
});

process.on('unhandledRejection', (reason) => {
    logger.error(reason, 'unhandled_rejection');
});

process.on('uncaughtException', (error) => {
    logger.fatal(error, 'uncaught_exception');
    process.exit(1);
});

bootstrap().catch((error) => {
    logger.fatal(error, 'bootstrap_failed');
    process.exit(1);
});
