import { Request, Response } from 'express';
import { CreateBookingUseCase } from '../../application/use-cases/CreateBookingUseCase';
import { PrismaBookingRepository } from '../../infrastructure/repositories/PrismaBookingRepository';
import { PrismaServiceRepository } from '../../infrastructure/repositories/PrismaServiceRepository';
import { RedisCacheService } from '../../infrastructure/cache/RedisCache';
import { createBookingSchema, paginationSchema } from '../../shared/validators/schemas';
import { AuthenticatedRequest } from '../middlewares/auth';
import { BookingStatus } from '../../domain/entities/Booking';
import { NotFoundError } from '../../shared/errors/AppError';

const bookingRepository = new PrismaBookingRepository();
const serviceRepository = new PrismaServiceRepository();
const cacheService = new RedisCacheService();

export class BookingController {
    static async create(req: AuthenticatedRequest, res: Response): Promise<void> {
        const dto = createBookingSchema.parse(req.body);
        const useCase = new CreateBookingUseCase(bookingRepository, serviceRepository, cacheService);
        const booking = await useCase.execute(req.userId!, dto);

        res.status(201).json({ status: 'success', data: booking });
    }

    static async list(req: AuthenticatedRequest, res: Response): Promise<void> {
        const { page, limit } = paginationSchema.parse(req.query);
        const { status, dateFrom, dateTo, professionalId, businessId } = req.query;

        const result = await bookingRepository.findAll(
            { page, limit },
            {
                status: status as BookingStatus | undefined,
                dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
                dateTo: dateTo ? new Date(dateTo as string) : undefined,
                professionalId: professionalId as string | undefined,
                businessId: businessId as string | undefined,
                clientId: req.userRole === 'CLIENT' ? req.userId : undefined,
            },
        );

        res.status(200).json({ status: 'success', data: result });
    }

    static async getById(req: Request, res: Response): Promise<void> {
        const booking = await bookingRepository.findById(req.params.id);
        if (!booking) throw new NotFoundError('Booking');

        res.status(200).json({ status: 'success', data: booking });
    }

    static async confirm(req: Request, res: Response): Promise<void> {
        const booking = await bookingRepository.findById(req.params.id);
        if (!booking) throw new NotFoundError('Booking');

        const updated = await bookingRepository.update(req.params.id, {
            status: BookingStatus.CONFIRMED,
        });

        res.status(200).json({ status: 'success', data: updated });
    }

    static async cancel(req: AuthenticatedRequest, res: Response): Promise<void> {
        const booking = await bookingRepository.findById(req.params.id);
        if (!booking) throw new NotFoundError('Booking');

        const updated = await bookingRepository.update(req.params.id, {
            status: BookingStatus.CANCELLED,
            cancelReason: req.body.cancelReason || 'Cancelled by user',
        });

        res.status(200).json({ status: 'success', data: updated });
    }

    static async stats(req: Request, res: Response): Promise<void> {
        const { businessId, dateFrom, dateTo } = req.query;
        const stats = await bookingRepository.getStats(
            businessId as string,
            dateFrom ? new Date(dateFrom as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            dateTo ? new Date(dateTo as string) : new Date(),
        );

        res.status(200).json({ status: 'success', data: stats });
    }
}
