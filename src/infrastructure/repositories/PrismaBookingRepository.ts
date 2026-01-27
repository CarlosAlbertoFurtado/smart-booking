import prisma from '../database/prisma';
import { Booking, BookingStatus } from '../../domain/entities/Booking';
import { IBookingRepository, PaginationParams, PaginatedResult, BookingFilters } from '../../domain/interfaces/repositories';

export class PrismaBookingRepository implements IBookingRepository {
    async create(booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>): Promise<Booking> {
        const created = await prisma.booking.create({
            data: {
                clientId: booking.clientId,
                professionalId: booking.professionalId,
                serviceId: booking.serviceId,
                businessId: booking.businessId,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                status: booking.status,
                notes: booking.notes,
            },
            include: {
                client: { select: { id: true, name: true, email: true, phone: true } },
                professional: { include: { user: { select: { name: true } } } },
                service: { select: { id: true, name: true, duration: true, price: true } },
                business: { select: { id: true, name: true } },
            },
        });
        return this.toDomain(created);
    }

    async findById(id: string): Promise<Booking | null> {
        const booking = await prisma.booking.findUnique({
            where: { id },
            include: {
                client: { select: { id: true, name: true, email: true, phone: true } },
                professional: { include: { user: { select: { name: true } } } },
                service: { select: { id: true, name: true, duration: true, price: true } },
                business: { select: { id: true, name: true } },
            },
        });
        if (!booking) return null;
        return this.toDomain(booking);
    }

    async findAll(params: PaginationParams & BookingFilters): Promise<PaginatedResult<Booking>> {
        const { page, limit, businessId, professionalId, clientId, status, dateFrom, dateTo } = params;

        const where: Record<string, unknown> = {};
        if (businessId) where.businessId = businessId;
        if (professionalId) where.professionalId = professionalId;
        if (clientId) where.clientId = clientId;
        if (status) where.status = status;
        if (dateFrom || dateTo) {
            where.date = {};
            if (dateFrom) (where.date as Record<string, unknown>).gte = dateFrom;
            if (dateTo) (where.date as Record<string, unknown>).lte = dateTo;
        }

        const [data, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
                include: {
                    client: { select: { id: true, name: true, email: true } },
                    professional: { include: { user: { select: { name: true } } } },
                    service: { select: { id: true, name: true, duration: true, price: true } },
                    business: { select: { id: true, name: true } },
                },
            }),
            prisma.booking.count({ where }),
        ]);

        return {
            data: data.map(this.toDomain),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findByProfessionalAndDate(professionalId: string, date: Date): Promise<Booking[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookings = await prisma.booking.findMany({
            where: {
                professionalId,
                date: { gte: startOfDay, lte: endOfDay },
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            orderBy: { startTime: 'asc' },
        });

        return bookings.map(this.toDomain);
    }

    async findConflicting(
        professionalId: string,
        date: Date,
        startTime: string,
        endTime: string,
        excludeId?: string,
    ): Promise<Booking[]> {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const where: Record<string, unknown> = {
            professionalId,
            date: { gte: startOfDay, lte: endOfDay },
            status: { in: ['PENDING', 'CONFIRMED'] },
            AND: [
                { startTime: { lt: endTime } },
                { endTime: { gt: startTime } },
            ],
        };

        if (excludeId) {
            where.id = { not: excludeId };
        }

        const bookings = await prisma.booking.findMany({ where });
        return bookings.map(this.toDomain);
    }

    async update(id: string, data: Partial<Booking>): Promise<Booking> {
        const updated = await prisma.booking.update({
            where: { id },
            data: {
                status: data.status,
                notes: data.notes,
                cancelReason: data.cancelReason,
            },
            include: {
                client: { select: { id: true, name: true, email: true } },
                professional: { include: { user: { select: { name: true } } } },
                service: { select: { id: true, name: true, duration: true, price: true } },
                business: { select: { id: true, name: true } },
            },
        });
        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await prisma.booking.delete({ where: { id } });
    }

    async getStats(
        businessId: string,
        dateFrom: Date,
        dateTo: Date,
    ): Promise<{ totalBookings: number; completed: number; cancelled: number; noShows: number; revenue: number }> {
        const bookings = await prisma.booking.findMany({
            where: {
                businessId,
                date: { gte: dateFrom, lte: dateTo },
            },
            include: {
                service: { select: { price: true } },
            },
        });

        const stats = {
            totalBookings: bookings.length,
            completed: bookings.filter((b) => b.status === 'COMPLETED').length,
            cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
            noShows: bookings.filter((b) => b.status === 'NO_SHOW').length,
            revenue: bookings
                .filter((b) => b.status === 'COMPLETED')
                .reduce((sum, b) => sum + b.service.price, 0),
        };

        return stats;
    }

    private toDomain(raw: Record<string, unknown>): Booking {
        const r = raw as {
            id: string;
            clientId: string;
            professionalId: string;
            serviceId: string;
            businessId: string;
            date: Date;
            startTime: string;
            endTime: string;
            status: string;
            notes: string | null;
            cancelReason: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        return new Booking({
            id: r.id,
            clientId: r.clientId,
            professionalId: r.professionalId,
            serviceId: r.serviceId,
            businessId: r.businessId,
            date: new Date(r.date),
            startTime: r.startTime,
            endTime: r.endTime,
            status: r.status as BookingStatus,
            notes: r.notes,
            cancelReason: r.cancelReason,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
        });
    }
}
